import {Packet} from "../packet";
import {ServerLoginPacketListener} from "./serverLoginPacketListener";
import {ByteBuffer} from "../../byteBuffer";

export class ServerboundHelloPacket implements Packet<ServerLoginPacketListener>
{
	handle(listener: ServerLoginPacketListener)
	{
		listener.handleHello(this);
	}

	write(byteBuffer: ByteBuffer)
	{
	}
}