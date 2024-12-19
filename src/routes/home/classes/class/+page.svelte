<script lang="ts">
	import { getContext } from "svelte";
	import type { PageData } from "./$types";
	import type { ClassSummary, Assignment, Gradebook } from "$lib/api-types";
	import type { AeriesApi } from "$lib/api";
	import AssignmentComponent from "$lib/components/AssignmentComponent.svelte";

	let { data }: { data: PageData } = $props();

	let gradebookPromise: Promise<Gradebook> | null = $state(null);
	let summaryPromise: Promise<ClassSummary | null> | null = $state(null);

	let api: AeriesApi = getContext("api");
	let as = api.authedStudent;
	if (data.classId !== null) {
		const classId = data.classId;

		as.subscribe(async (val) => {
			if (val != null) {
				console.log("getting assignments for", classId);
				summaryPromise = api
					.getClassSummaries()
					.then(
						(summaries) =>
							summaries.find((summary) => summary.GradeBookNumber == classId) ??
							null,
					);
				gradebookPromise = summaryPromise.then((summary) =>
					api.getGradebook(classId, summary!.TermCode),
				);

				console.log(await api.predictGrade(classId, "Assessments", 240, 250));
			}
		});
	}
</script>

<!--  I gutted out the loading state, but we need to add it back -->

{#await summaryPromise}
	<h1>Loading ...</h1>
{:then summary}
	{#if summary === null}
		<h1>Class Not Found</h1>
		<a href="/home/classes">go back</a>
	{:else}
		<div class="flex flex-col gap-4 p-4">
			<h1 class="text-4xl">
				{summary.GradeBookName} - {summary?.Average || summary?.Percent + "%"}
			</h1>
			{#await gradebookPromise}
				<p>Loading assignments ...</p>
			{:then gradebook}
				<div class="flex flex-col">
					{#if gradebook !== null}
						<ul>
						{#each gradebook.Assignments as assignment}
							<AssignmentComponent {assignment}></AssignmentComponent>
						{/each}
						</ul>
						<p1>{$as != null ? "initialized" : "uninitialized"}</p1>
					{/if}
				</div>
			{:catch err}
				<span>ERROR while loading gradebook: <code>{err.message}</code></span>
				<pre>{err.stack}</pre>
			{/await}
		</div>
	{/if}
{:catch err}
	<span>ERROR while loading class summary: <code>{err.message}</code></span>
	<pre>{err.stack}</pre>
{/await}
