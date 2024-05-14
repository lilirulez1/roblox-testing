import {ByteBuffer} from "./byteBuffer";
import {Packet} from "./protocol/packet";
import {ConnectionProtocol} from "./connectionProtocol";

export class PacketDecoder
{
	read(buffer: ByteBuffer)
	{
		const result = new Array<Packet<any>>();
		this.decode(buffer, result);
		return result.remove(0) as Packet<any>;
	}

	private decode(buffer: ByteBuffer, result: Packet<any>[])
	{
		const packetId = buffer.readUnsignedInt();

		result.push(ConnectionProtocol.PACKETS.createPacket(packetId, buffer) as Packet<any>);
	}
}