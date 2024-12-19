import {
	AuthRequestData,
	type Assignment,
	type AuthResponseData,
	type ClassSummary,
	type ClassSummaryDatum,
	type HomeScreenData,
	isFail,
	type Student,
	type AuthenticatedStudent,
	type Gradebook,
} from "./api-types";

import { generateKeyFromTimestamp, getTimeFormatted } from "./auth/keygen";

import { writable, type Writable, get } from "svelte/store";

export class UninitializedApiError extends Error {
	constructor() {
		super("AeriesApi was not initialized");
		this.name = "UninitializedApiError";
	}
}

export class AeriesApi {
	public apiUrl: URL;
	public authedStudent: Writable<AuthenticatedStudent | null>;

	public constructor(apiUrl: URL, authedStudent: AuthenticatedStudent | null) {
		this.apiUrl = apiUrl;
		this.authedStudent = writable(authedStudent);
	}

	public isInitialized(): boolean {
		return get(this.authedStudent) != null;
	}

	// return true if able to authenticate
	public async authenticate(
		username: string,
		password: string
	): Promise<Boolean> {
		if (this.isInitialized()) {
			console.log(
				"Not sending authentication request because we are already authenticated!"
			);
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
			console.log(`Authentication fail: ${data}`);
			return false;
		} else {
			console.log("Authentication success!");
			this.authedStudent.set({
				Token: data.AccessToken,
				Student: data.Students[0],
			});
			return true;
		}
	}

	private genRequest(
		method: string,
		url: URL | string,
		body?: object
	): Request {
		let headers: { [id: string]: string } = {};
		if (url !== "/authentication") {
			if (!this.isInitialized()) throw new UninitializedApiError();
			headers["Authorization"] = `Bearer ${get(this.authedStudent)!.Token}`;
		}
		body = { url: this.apiUrl + url.toString(), method, headers, ...body };
		return new Request("/proxy", {
			body: JSON.stringify(body),
			method: "POST",
		});
	}

	public async getHomePage(): Promise<HomeScreenData> {
		if (!this.isInitialized()) throw new UninitializedApiError();
		let resp = await fetch(
			this.genRequest(
				"GET",
				`/student/${
					get(this.authedStudent)!.Student.Demographics.StudentID
				}/homescreendata`
			)
		);
		return await resp.json();
	}

	public async getClassSummaries(
		term: string = "Current Terms"
	): Promise<ClassSummary[]> {
		if (!this.isInitialized()) throw new UninitializedApiError();
		let resp = await fetch(
			this.genRequest(
				"GET",
				`/student/${
					get(this.authedStudent)!.Student.Demographics.StudentID
				}/classsummary`
			)
		);
		let datum = (await resp.json()) as ClassSummaryDatum[];

		return datum
			.map((datum) => datum.ClassSummary.filter((x) => x.Term == term))
			.flat();
	}
	public async getGradebook(
		gradebookNumber: number,
		term: string
	): Promise<Gradebook> {
		if (!this.isInitialized()) throw new UninitializedApiError();
		let resp = await fetch(
			this.genRequest(
				"GET",
				`/${get(this.authedStudent)!.Student.Demographics.SchoolCode}/student/${
					get(this.authedStudent)!.Student.Demographics.StudentID
				}/gradebooks/${gradebookNumber}/${term}`
			)
		);
		return await resp.json();
	}
	public async predictGrade(classId: number, category: string, score: number, maxScore: number, assignmentNumber: number = -1) {
		if (!this.isInitialized()) throw new UninitializedApiError();
		let resp = await fetch(
			this.genRequest(
				"POST",
				'/calculategradebookscores',
				{
					gn: {
						Assignments: [{
							AssignmentNumber: assignmentNumber,
							Category: category,
							Mark: "",
							Score: score,
							MaxScore: maxScore
						}],
						GradebookNumber: classId,
						TermCode: "F"
					},
					id: get(this.authedStudent)!.Student.Demographics.StudentID,
					sc: get(this.authedStudent)!.Student.Demographics.SchoolCode
				}
			)
		);
		return await resp.json();
	}
	public async getReportCards() {
		if (!this.isInitialized()) throw new UninitializedApiError();
		let resp = await fetch(
			this.genRequest("GET", `/reportcardhistory/${get(this.authedStudent)!.Student.Demographics.StudentID}`)
		);
		return await resp.json();
	}
}
