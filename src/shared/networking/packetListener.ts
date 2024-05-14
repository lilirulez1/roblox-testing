export interface PacketListener
{
	isAcceptingMessages(): boolean;

	onDisconnect(reason: string): void;
}