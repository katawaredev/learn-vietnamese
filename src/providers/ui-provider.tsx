import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

interface UIContextType {
	isTelexInputActive: boolean;
	setTelexInputActive: (active: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
	const [telexInputsCount, setTelexInputsCount] = useState(0);

	const setTelexInputActive = useCallback((active: boolean) => {
		setTelexInputsCount((prev) => Math.max(0, prev + (active ? 1 : -1)));
	}, []);

	const value = useMemo(
		() => ({ isTelexInputActive: telexInputsCount > 0, setTelexInputActive }),
		[telexInputsCount, setTelexInputActive],
	);

	return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
	const context = useContext(UIContext);
	if (context === undefined) {
		throw new Error("useUI must be used within a UIProvider");
	}
	return context;
}

export function useNotifyTelexActive() {
	const { setTelexInputActive } = useUI();
	useEffect(() => {
		setTelexInputActive(true);
		return () => setTelexInputActive(false);
	}, [setTelexInputActive]);
}
