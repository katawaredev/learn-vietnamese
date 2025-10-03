import { ArrowLeft, Menu } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button, LinkButton } from "~/components/Button.tsx";
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

	return (
		<>
			<header className="flex items-center justify-between px-4 pt-4 pb-12">
				{/* Left side - Back button or spacer */}
				<div className="w-10">
					{!hideBackButton && (
						<LinkButton variant="ghost" to="/" className="p-2">
							<ArrowLeft className="h-6 w-6" />
						</LinkButton>
					)}
				</div>

				{/* Center - Optional custom component */}
				<div className="flex max-w-6xl flex-1 justify-center px-4">
					{children}
				</div>

				{/* Right side - Settings */}
				<div className="flex w-10 justify-end">
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
