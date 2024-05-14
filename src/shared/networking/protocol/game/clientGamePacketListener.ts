import {ClientboundDisconnectPacket} from "./clientboundDisconnectPacket";
import {PacketListener} from "../../packetListener";
import {ClientboundKeepAlivePacket} from "./clientboundKeepAlivePacket";

export interface ClientGamePacketListener extends PacketListener
{
	handleKeepAlive(packet: ClientboundKeepAlivePacket): void;

	handleDisconnect(packet: ClientboundDisconnectPacket): void;
}