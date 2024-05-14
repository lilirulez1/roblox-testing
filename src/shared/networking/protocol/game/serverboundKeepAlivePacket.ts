import {ServerGamePacketListener} from "./serverGamePacketListener";
import {Packet} from "../packet";
import {ByteBuffer} from "../../byteBuffer";

export class ServerboundKeepAlivePacket implements Packet<ServerGamePacketListener>
{
	private readonly _id: number;

	constructor(value: number | ByteBuffer)
	{
		if (value instanceof ByteBuffer)
		{
			this._id = value.readUnsignedInt();
		} else
		{
			this._id = value;
		}
	}

	handle(listener: ServerGamePacketListener)
	{
		listener.handleKeepAlive(this);
	}

	write(byteBuffer: ByteBuffer)
	{
		byteBuffer.writeUnsignedInt(this._id);
	}

	id()
	{
		return this._id;
	}
}