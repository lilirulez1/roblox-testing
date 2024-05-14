function IsArray(Value: unknown): Value is number[]
{
	if (!typeIs(Value, "table")) return false;
	return typeIs((Value as number[])[0], "number");
}

export class Address
{
	rawAddress: number;

	constructor(address: Array<number> | Address)
	{
		if (IsArray(address))
		{
			let Address = address[3] & 0xff;
			Address |= (address[2] << 8) & 0xff00;
			Address |= (address[1] << 16) & 0xff0000;
			Address |= (address[0] << 24) & 0xff00000;
			this.rawAddress = Address;
		} else
		{
			this.rawAddress = (address as Address).rawAddress;
		}
	}

	static numericToTextFormat(Src: number[]): string
	{
		return (Src[0] & 0xff) + "." + (Src[1] & 0xff) + "." + (Src[2] & 0xff) + "." + (Src[3] & 0xff);
	}

	getAddress()
	{
		const Addr = new Array<number>(4);

		Addr[0] = (this.rawAddress >>> 24) & 0xff;
		Addr[1] = (this.rawAddress >>> 16) & 0xff;
		Addr[2] = (this.rawAddress >>> 8) & 0xff;
		Addr[3] = this.rawAddress & 0xff;

		return Address.numericToTextFormat(Addr);
	}
}
