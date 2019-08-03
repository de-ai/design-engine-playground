
import arg from 'arg';
import { syncPlayground } from './main';

function parseArgumentsIntoOptions(rawArgs) {
	const args = arg({
		'--sync': Boolean,
		'--yes': Boolean,
		'-c': '--sync',
		'-y': '--yes'
	}, {
		argv: rawArgs.slice(2)
	});

	return ({
		skipPrompts: args['--yes'] || false,
		syncPlayground: args['--sync'] || false,
		template: args._[0]
	});
}

export async function cli(args) {
	console.log('cli()', args);

	let options = parseArgumentsIntoOptions(args);
	console.log(options);

	await syncPlayground(options);
}
