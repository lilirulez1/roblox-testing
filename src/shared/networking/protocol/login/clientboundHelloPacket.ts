import {Packet} from "../packet";
import {ClientLoginPacketListener} from "./clientLoginPacketListener";
import {ByteBuffer} from "../../byteBuffer";

export class ClientboundHelloPacket implements Packet<ClientLoginPacketListener>
{
	handle(listener: ClientLoginPacketListener)
	{
		listener.handleHello(this);
	}

	write(byteBuffer: ByteBuffer)
	{
	}
}