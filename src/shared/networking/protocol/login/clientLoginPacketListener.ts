import {PacketListener} from "../../packetListener";
import {ClientboundHelloPacket} from "./clientboundHelloPacket";
import {ClientboundLoginDisconnectPacket} from "./clientboundLoginDisconnectPacket";

export interface ClientLoginPacketListener extends PacketListener
{
	handleHello(packet: ClientboundHelloPacket): void;

	handleDisconnect(packet: ClientboundLoginDisconnectPacket): void;
}