<script>
	import {onMount} from "svelte";
	// https://github.com/rob-balfre/svelte-select
	import Select from 'svelte-select';

	
	import { writable,get } from 'svelte/store';

	export let rendered = writable(0);
	export let datastore = writable({});

	let name = 'world';
	console.log("datastore", get(datastore));

  onMount(() => {
		rendered.set(1);
  });
</script>

<table>

</table>