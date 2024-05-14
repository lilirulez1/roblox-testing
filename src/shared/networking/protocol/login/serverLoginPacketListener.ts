import {PacketListener} from "../../packetListener";
import {ServerboundHelloPacket} from "./serverboundHelloPacket";
import {ServerboundLoginAcknowledgedPacket} from "./serverboundLoginAcknowledgedPacket";

export interface ServerLoginPacketListener extends PacketListener
{
	handleHello(packet: ServerboundHelloPacket): void;

	handleLoginAcknowledged(packet: ServerboundLoginAcknowledgedPacket): void;
}