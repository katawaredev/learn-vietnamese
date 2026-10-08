"""Rebuild the bundled sea-g2p WASM from pinned Apache-2.0 source.

Requires Rust with wasm32-unknown-unknown. The application ships the generated
WASM; users do not need Rust or Python. Only memory loading and batch scheduling
are adapted. Pronunciation and normalization rules remain upstream code.
"""
import io
import pathlib
import shutil
import subprocess
import tarfile
import tempfile
import urllib.request

REVISION = "e825173f235d08ea19315b2b279fb11153b44cea"
ROOT = pathlib.Path(__file__).resolve().parents[2]
BRIDGE = r'''
use std::sync::{Arc, OnceLock};
pub static DICTIONARY: OnceLock<Arc<[u8]>> = OnceLock::new();

#[no_mangle]
pub extern "C" fn sea_alloc(len: usize) -> *mut u8 {
    Box::into_raw(vec![0u8; len].into_boxed_slice()) as *mut u8
}
#[no_mangle]
pub unsafe extern "C" fn sea_free(ptr: *mut u8, len: usize) {
    drop(Box::from_raw(std::ptr::slice_from_raw_parts_mut(ptr, len)));
}
#[no_mangle]
pub unsafe extern "C" fn sea_init(ptr: *mut u8, len: usize) -> *mut crate::capi::SeaG2p {
    let bytes = Box::from_raw(std::ptr::slice_from_raw_parts_mut(ptr, len));
    if DICTIONARY.set(Arc::from(bytes)).is_err() { return std::ptr::null_mut(); }
    crate::capi::sea_g2p_open(b"browser\0".as_ptr() as *const std::ffi::c_char)
}
'''

with tempfile.TemporaryDirectory(prefix="sea-g2p-build-") as directory:
    source = pathlib.Path(directory)
    archive = urllib.request.urlopen(
        f"https://api.github.com/repos/pnnbao97/sea-g2p/tarball/{REVISION}", timeout=60
    ).read()
    with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as tar:
        for item in tar.getmembers():
            parts = pathlib.PurePosixPath(item.name).parts[1:]
            if not parts or ".." in parts or not item.isfile():
                continue
            target = source.joinpath(*parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(tar.extractfile(item).read())
    cargo = source / "Cargo.toml"
    cargo.write_text(cargo.read_text().replace('memmap2 = "0.9"\n', '').replace('rayon = "1.10"\n', '') +
                     '\n[profile.release]\nopt-level = "s"\nlto = true\nstrip = true\npanic = "abort"\n')
    dictionary = source / "src/core/dict.rs"
    text = dictionary.read_text().replace('use memmap2::Mmap;\nuse std::fs::File;', 'use std::sync::Arc;')
    text = text.replace('mmap: Mmap,', 'mmap: Arc<[u8]>,')
    text = text.replace('pub fn new(path: &str)', 'pub fn new(_path: &str)')
    text = text.replace('let file = File::open(path)?;\n        let mmap = unsafe { Mmap::map(&file)? };',
                        'let mmap = crate::browser::DICTIONARY.get().ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "Dictionary not loaded"))?.clone();')
    dictionary.write_text(text)
    normalizer = source / "src/lang/vi/mod.rs"
    normalizer.write_text(normalizer.read_text().replace('        use rayon::prelude::*;\n', '').replace('texts.into_par_iter()', 'texts.into_iter()'))
    lib = source / "src/lib.rs"
    lib.write_text(lib.read_text() + '\npub mod browser;\n')
    (source / "src/browser.rs").write_text(BRIDGE)
    subprocess.run(['cargo', 'build', '--release', '--target', 'wasm32-unknown-unknown',
                    '--no-default-features', '--features', 'capi'], cwd=source, check=True)
    output = ROOT / "public/speech"
    output.mkdir(parents=True, exist_ok=True)
    asset = ROOT / "src/features/speech/local/assets/sea-g2p.wasm"
    asset.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source / "target/wasm32-unknown-unknown/release/sea_g2p_rs.wasm", asset)
    shutil.copyfile(source / "LICENSE", output / "sea-g2p-LICENSE.txt")
    print(f"Built sea-g2p {REVISION} -> {asset}")
