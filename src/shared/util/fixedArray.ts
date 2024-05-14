export class FixedArray<T extends defined>
{
	length: number;
	private readonly _array: Array<T>;

	constructor(length: number);
	constructor(length: number, fill: T);
	constructor(length: number, fill?: T)
	{
		this.length = length;

		if (fill)
		{
			this._array = new Array<T>(length, fill);
		} else
		{
			this._array = new Array<T>(length);
		}
	}

	forEach(callback: (value: T, index: number, array: readonly T[]) => void)
	{
		this._array.forEach(callback);
	}

	size(): number
	{
		return this._array.size();
	}

	[n: number]: T;

	private ["__index"](index: number)
	{
		if (FixedArray[<keyof typeof FixedArray<T>>(<unknown>index)])
		{
			return FixedArray[<keyof typeof FixedArray<T>>(<unknown>index)];
		}

		if (index >= 0 && index < this.length)
		{
			return this._array[index];
		} else
		{
			throw error("Index out of bounds");
		}
	}

	private ["__newindex"](index: number, value: T)
	{
		if (typeIs(index, "string"))
		{
			rawset(this, index, value);
			return;
		}

		if (index >= 0 && index < this.length)
		{
			this._array[index] = value;
		} else
		{
			throw error("Index out of bounds");
		}
	}
}
