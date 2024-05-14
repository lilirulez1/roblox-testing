export class Future
{
	private _success = false;

	isSuccess()
	{
		return this._success;
	}

	success()
	{
		this._success = true;
		return this;
	}
}