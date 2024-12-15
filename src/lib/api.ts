import {
	type AuthedStudent,
	AuthRequestData,
	type AuthResponseData,
	type HomeScreenData,
	isFail,
} from "./api-types";

import { generateKeyFromTimestamp, getTimeFormatted } from "./auth/keygen";

export class UninitializedApiError extends Error {
	constructor() {
		super("AeriesApi was not initialized");
		this.name = "UninitializedApiError";
	}
}

export class AeriesApi {
	public apiUrl: URL;
	private authedStudent: AuthedStudent | null;

	constructor(apiUrl: URL, authedStudent: AuthedStudent | null) {
		this.apiUrl = apiUrl;
		this.authedStudent = authedStudent;
	}

	// return true if able to authenticate
	async authenticate(username: string, password: string): Promise<Boolean> {
		if (this.authedStudent != null) {
			console.log("Skipping authentication because already authenticated!");
			return true;
		}
		/* assume it sets `student` & `token` */
		const timestamp = getTimeFormatted();
		const secretKey = await generateKeyFromTimestamp(getTimeFormatted());
		let authData = new AuthRequestData(
			secretKey,
			timestamp,
			password,
			username
		);

		let resp = await fetch(
			this.genRequest("POST", "/authentication", authData)
		);

		if (!resp.ok) {
			return false;
		}

		let data = (await resp.json()) as AuthResponseData;
		console.log(data);

		if (isFail(data)) {
			console.log("auth fail!");
			return false;
		} else {
			console.log("auth success");
			this.authedStudent = {
				Token: data.AccessToken,
				Student: data.Students[0],
			};
			return true;
		}
	}

	genRequest(method: string, url: URL | string, body?: object): Request {
		let headers: { [id: string]: string } = {};
		if (url !== "/authentication") {
			if (this.authedStudent === null) throw new UninitializedApiError();
			headers["Authorization"] = `Bearer ${this.authedStudent.Token}`;
		}
		body = { url: this.apiUrl + url.toString(), method, headers, ...body };
		return new Request("/proxy", {
			body: JSON.stringify(body),
			method: "POST",
		});
	}

	getAuthedStudent(): AuthedStudent | null {
		return this.authedStudent;
	}

	async getHomePage(): Promise<HomeScreenData> {
		if (this.authedStudent === null) throw new UninitializedApiError();
		let resp = await fetch(
			this.genRequest(
				"GET",
				`/student/${this.authedStudent.Student.Demographics.StudentID}/homescreendata`
			)
		);
		return await resp.json();
	}
}
