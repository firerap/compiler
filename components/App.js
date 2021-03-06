import React from 'react';

import Lexer from '../lexer';
import SyntaxAnalyser from '../syntax-analyzer';
import RPNGenerator from '../rpn-generator';

import ConstantTable from './ConstantTable';
import RPNBuilderTable from './RPNBuilderTable';
import IdTable from './IdTable';
import Lexems from './Lexems';
import Errors from './Errors';
import Console from './Console';
import LabelTable from './LabelTable';


// const defaultProgram = `
// program fib {
// 	i := 0;
// 	a := 0;
// 	b := 1;
// 	read(n);
// 	while i < n do {
// 		new := a + b;
// 		a := b;
// 		b := new;
// 		i := i + 1;
// 	};
// 	write(b);
// }
// `.trim();

const defaultProgram = `
program sumProgression {
	read(max);
	sum := 0;
	i := max;
	while i > 0 do
		if i < 3 then
			write(i * i);
		else
			write(-i * i);
		endif;
		sum := sum + i;
		i := i - 1;
	done;
	write(sum);
}
`.trim();

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			program: defaultProgram,
		}
	}
	onKeyUp(event) {
		const program = event.target.value;
		this.setState({ program });
	}
	onKeyDown(event) {
		if (event.keyCode === 9) {
			const pos = event.target.selectionStart;
			const text = event.target.value;

			event.target.value = text.slice(0, pos) + '\t' + text.slice(pos);
			event.target.selectionStart = pos + 1;
			event.target.selectionEnd = pos + 1;
			event.preventDefault();
			return false;
		}
		console.log(event.keyCode);
	}

	render() {
		const lexer = new Lexer(this.state.program);
		let error = null;
		let rpnSteps = [];
		let labelList = {};
		let rpn = [];
		try {
			this.lexerData = lexer.lex();
			const syntaxAnalyser = new SyntaxAnalyser(this.lexerData.tokens);
			syntaxAnalyser.analyze();

			const rpnGenerator = new RPNGenerator();
			const rpnGeneratorResult = rpnGenerator.generate(this.lexerData);
			rpnSteps = rpnGeneratorResult.steps;
			labelList = rpnGeneratorResult.labelList;
			rpn = rpnGeneratorResult.rpn;
			console.log('steps', rpnSteps);

		} catch (e) {
			this.lexerData.error = e.message;
			console.error(e);
			error = e.message;
		}
		console.log(this.lexerData)
		console.log('LABELS', labelList)
		return (
			<div>
				<div className="row">
					<textarea
						className="text-editor small-3 large-3 columns"
						onKeyUp={this.onKeyUp.bind(this)}
						onKeyDown={this.onKeyDown.bind(this)}
						defaultValue={this.state.program}>
					</textarea>
					<div className="small-6 large-6 columns">
						<h3>Console</h3>
						<Console lexerData={this.lexerData} />
					</div>
				</div>
				<div>
					{error && <Errors error={error}/>}
				</div>
				<div className="row">
					<div className="small-3 large-3 columns">
						<h3>Constant Table</h3>
						<ConstantTable constants={this.lexerData.constantTable}/>
					</div>
					<div className="small-3 large-3 columns">
						<h3>Id Table</h3>
						<IdTable ids={this.lexerData.idTable}/>
					</div>
					<div className="small-3 large-3 columns">
						<h3>Label Table</h3>
						<LabelTable labels={labelList}/>
					</div>
				</div>
				<div className="row">
					<h3>Final RPN</h3>
					<div>
						{rpn.map(token => token.text).join(' ')}
					</div>
				</div>
				<div className="row">
					<h3>RPN Table</h3>
					<RPNBuilderTable steps={rpnSteps} />
				</div>
				<div className="row">
					<h3>All tokens</h3>
					<Lexems className="small-2 large-4 columns" tokens={this.lexerData.tokens}/>
				</div>
			</div>
		)
	}
}
