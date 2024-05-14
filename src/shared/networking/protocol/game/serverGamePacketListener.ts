import {PacketListener} from "../../packetListener";
import {ServerboundKeepAlivePacket} from "./serverboundKeepAlivePacket";

export interface ServerGamePacketListener extends PacketListener
{
	handleKeepAlive(packet: ServerboundKeepAlivePacket): void;
}