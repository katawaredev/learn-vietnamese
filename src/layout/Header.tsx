import { ArrowLeft, Menu } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button, LinkButton } from "~/components/Button.tsx";
import { TelexCheatsheet } from "~/components/TelexCheatsheet";
import { useUI } from "~/providers/ui-provider";
import { SettingsDrawer } from "./SettingsDrawer";

interface HeaderProps {
	hideBackButton?: boolean;
	children?: ReactNode;
}

export default function Header({
	hideBackButton = false,
	children,
}: HeaderProps) {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const { isTelexInputActive } = useUI();

	return (
		<>
			<header className="flex items-center px-4 pt-4 pb-12">
				{/* Left side - Back button or spacer */}
				<div className="flex flex-1 items-center">
					{!hideBackButton && (
						<LinkButton variant="ghost" to="/" className="p-2">
							<ArrowLeft className="h-6 w-6" />
						</LinkButton>
					)}
				</div>

				{/* Center - Optional custom component */}
				<div className="flex shrink-0 justify-center px-4">{children}</div>

				{/* Right side - Settings */}
				<div className="flex flex-1 items-center justify-end gap-2">
					{isTelexInputActive && <TelexCheatsheet />}
					<Button
						variant="ghost"
						className="p-2"
						onClick={() => setIsSettingsOpen(true)}
					>
						<Menu className="h-6 w-6" />
					</Button>
				</div>
			</header>

			{/* Settings Drawer */}
			<SettingsDrawer
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
			/>
		</>
	);
}
