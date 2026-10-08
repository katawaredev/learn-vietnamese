import { Effect } from "effect";

// Browser callbacks need cleanup on completion as well as interruption.
export function browserResource<A, E>(
	register: (
		resume: (result: Effect.Effect<A, E>) => void,
		signal: AbortSignal,
	) => (() => void) | void,
) {
	return Effect.scoped(
		Effect.gen(function* () {
			let dispose: (() => void) | void;
			yield* Effect.addFinalizer(() => Effect.sync(() => dispose?.()));
			return yield* Effect.callback<A, E>((resume, signal) => {
				dispose = register(resume, signal);
			});
		}),
	);
}
