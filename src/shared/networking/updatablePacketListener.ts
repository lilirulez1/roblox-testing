import {PacketListener} from "./packetListener";

export interface UpdatablePacketListener extends PacketListener
{
	update(): void;
}
