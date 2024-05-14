import {Packet} from "../packet";
import {ClientLoginPacketListener} from "./clientLoginPacketListener";
import {ByteBuffer} from "../../byteBuffer";

export class ClientboundLoginDisconnectPacket implements Packet<ClientLoginPacketListener>
{
	private readonly _reason: string;

	constructor(value: string | ByteBuffer)
	{
		if (value instanceof ByteBuffer)
		{
			this._reason = value.readString();
		} else
		{
			this._reason = value;
		}
	}

	handle(listener: ClientLoginPacketListener)
	{
		listener.handleDisconnect(this);
	}

	write(byteBuffer: ByteBuffer)
	{
		byteBuffer.writeString(this._reason);
	}

	reason()
	{
		return this._reason;
	}
}