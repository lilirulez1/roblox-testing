import {Packet} from "./protocol/packet";
import {ByteBuffer} from "./byteBuffer";
import {ConnectionProtocol} from "./connectionProtocol";
import {Channel} from "./channel";

export class PacketEncoder
{
	write(channel: Channel, packet: Packet<any>)
	{
		const buffer = new ByteBuffer();

		this.encode(packet, buffer);

		channel.bufferWrite(buffer);
	}

	private encode(packet: Packet<any>, buffer: ByteBuffer)
	{
		const packetId = ConnectionProtocol.PACKETS.getID(packet);

		if (packetId === undefined)
		{
			error(`[Undefined Packet] ${tostring(getmetatable(packet))}`);
		}

		buffer.writeUnsignedInt(packetId);

		try
		{
			packet.write(buffer);
		} catch (exception)
		{
			error(exception);
		}
	}
}