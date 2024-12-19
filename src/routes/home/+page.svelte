<script lang="ts">
	import type { AeriesApi } from "$lib/api";
	import type { Assignment } from "$lib/api-types";
	import { getContext, onMount } from "svelte";
	import { type Writable } from "svelte/store";
	import AssignmentComponent from "$lib/components/AssignmentComponent.svelte";

	const api: AeriesApi = getContext("api");
	let assignmentsPromise: Promise<Assignment[]> | null = $state(null);
	let as = api.authedStudent;

	as.subscribe(async (val) => {
		console.log("update!", val);
		if (val != null) {
			console.log("calling home page update!");
			assignmentsPromise = api.getHomePage().then((x) => x.RecentChanges);
			assignmentsPromise.then(console.log);
		}
	});
</script>

<div class="flex flex-col gap-4 p-4">
	<h1 class="text-4xl">Home</h1>
	<div class="flex flex-col">
		{#await assignmentsPromise}
			<p>Loading recently changed assignments ...</p>
		{:then assignments}
			{#if assignments !== null}
				{#each assignments as assignment}
					<AssignmentComponent {assignment}></AssignmentComponent>
				{/each}
			{/if}
		{:catch err}
			<span>ERROR occured while getting recent changes: <code>{err.message}</code></span>
			<pre>{err.stack}</pre>
		{/await}

		<p1>{$as != null ? "initialized" : "uninitialized"}</p1>
	</div>
</div>
