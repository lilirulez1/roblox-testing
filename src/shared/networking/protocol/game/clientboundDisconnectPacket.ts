import {Packet} from "../packet";
import {ClientGamePacketListener} from "./clientGamePacketListener";
import {ByteBuffer} from "../../byteBuffer";

export class ClientboundDisconnectPacket implements Packet<ClientGamePacketListener>
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

	handle(listener: ClientGamePacketListener)
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