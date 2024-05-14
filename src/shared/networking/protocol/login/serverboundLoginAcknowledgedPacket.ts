import {Packet} from "../packet";
import {ServerLoginPacketListener} from "./serverLoginPacketListener";
import {ByteBuffer} from "../../byteBuffer";

export class ServerboundLoginAcknowledgedPacket implements Packet<ServerLoginPacketListener>
{
	handle(listener: ServerLoginPacketListener)
	{
		listener.handleLoginAcknowledged(this);
	}

	write(byteBuffer: ByteBuffer)
	{
	}
}