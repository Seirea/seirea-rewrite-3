<script lang="ts">
	import type { Assignment, GradebookAssignment } from "$lib/api-types";
	import { fade } from 'svelte/transition';

	interface Props {
		assignment: Assignment | GradebookAssignment;
	}

	let {assignment}: Props = $props();
	function isGradeBook(assign: Assignment | GradebookAssignment): assign is GradebookAssignment {
		return (assign as Assignment).LastUpdated === undefined;
	}
	const trunc = (x: string) => x.substring(6, x.length - 2);

	let dd = trunc(!isGradeBook(assignment) ? assignment.LastUpdated : assignment.DateDue);
</script>


<li
	transition:fade|global={{ duration: 200 }}
	class="flex flex-col border-2 rounded-md my-1 p-2 bg-gradient-to-tr from-indigo-100 to-blue-100 border-slate-200"
>
	<div class="flex flex-row justify-between text-xl">
		{#if !isGradeBook(assignment)}
			<p>{assignment.AssignmentName}</p>
		{:else}
			<p>{assignment.Description}</p>
		{/if}
		<p>
			{assignment.Score}/{assignment.MaxScore} ({!isGradeBook(assignment) ? assignment.Percentage : assignment.Percent}%)
		</p>
	</div>
	<div class="flex flex-row justify-between">
		{#if !isGradeBook(assignment)}
			<p>{assignment.GradebookName}</p>
		{:else}
			<p>{assignment.Category}</p>
		{/if}
		<p>{new Date(parseInt(dd, 10)).toLocaleString()}</p>
	</div>
</li>
