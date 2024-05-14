import {FixedArray} from "./fixedArray";

export class SampleLogger
{
	private readonly _samples = new FixedArray<number>(240);

	private _start: number = 0;
	private _size: number = 0;

	logSample(sample: number): void
	{
		const index = this.wrapIndex(this._start + this._size);
		this._samples[index] = sample;

		if (this._size < 240)
		{
			++this._size;
		} else
		{
			this._start = this.wrapIndex(this._start + 1);
		}
	}

	capacity(): number
	{
		return this._samples.length;
	}

	size(): number
	{
		return this._size;
	}

	get(index: number): number
	{
		if (index >= 0 && index < this._size)
		{
			return this._samples[this.wrapIndex(this._start + index)];
		} else
		{
			error(`${index} out of bounds for length ${this._size}`);
		}
	}

	reset(): void
	{
		this._start = 0;
		this._size = 0;
	}

	wrapIndex(index: number)
	{
		return index % 240;
	}
}
