/* by Caleb Spiess/Gigabitten
 * This was an adventure. I didn't think it would take so long, but I'm glad I did it.
 */
import React from 'react';
import './App.css';
import Tree from './tree.js';

const treeTypes = ["lambda", "expressionList", "ident"];

function test() { // for some reason I couldn't get assert working, but building my own was very easy
    let result = "";
    let tests = [
	["(\\a.a)b"
	 ,"b"],
	["(\\a.a)(\\x.\\y.xy)(\\h.h)p"
	 ,"p"],
	["(\\w.\\y.\\x.y(wyx))(\\s.\\z.sz)"
	 ,"(\\y.(\\x.yyx))"],
	["potato"
	 ,"potato"]
    ];
    let testResults = tests.map(([input, expected]) => {
	let actual = parse(input);
	if(actual !== expected) {
	    return `Input: ${input}\nExpected: ${expected}\nActual: ${actual}\n`;
	} else return actual;
    });
    let notPassed = testResults.filter(x => x.startsWith('Input: '));
    if(notPassed.length === 0) {
        result += "Passed every test case!\n\n";
        tests.map(([input, expected], i) => {
            result += `Input: ${input}\nResult: ${testResults[i]}\n`;
        });
    }
    else {
        notPassed.map(x => result += x);
    }
    return result;
}

function printTree(tree) {
    // who's ready for a lot of undefined checking and recursion
    let acc = "";
    if(tree !== undefined) {
	if(tree.lambda !== undefined) {
            acc += "(";
            if(tree.lambda !== undefined) {
		acc += "\\";
		acc += tree.lambda.lambdaIdent;
		acc += ".";
		acc += printTree(tree.lambda);
            }
            
            acc += ")";
	}
	if(tree.ident !== undefined) acc += tree.ident;
	if(tree.expressionList !== undefined) acc += printTree(tree.expressionList);
    }
    return acc;
}

let doApplications = function(node, key) {
    if(node.lambda !== undefined && node.expressionList !== undefined) {
	let current = node;
	let next = node.expressionList;
	node = apply(next, current);
        return [true, node];
    } else return [false, node];
    // yep, that's the hack alright
}
/* deprecated; didn't even work very well, do not re-enable without care, probably buggy or useless
  function cleanTree(tree) {
  tree = traverseTree(tree, (node, key) => {
  if(key === "expressionList"
  && node.expressionList !== undefined
  && node.ident === undefined
  && node.lambda === undefined) {
  node = node.expressionList;
  }
  return node;
  });
  return tree;
  }
*/ 
function append(toAppend, node) {
    if(node === undefined || toAppend === undefined) return node;
    if(node.expressionList === undefined) node.expressionList = toAppend;
    else {
	let expr = node.expressionList;
	node.expressionList = append(toAppend, expr);
    }
    return node;
}

function apply(arg, expr) {
    //    console.log(`Applying ${printTree(arg)} to ${printTree(expr)}...`);
    let lam = expr.lambda;
    if(lam.expressionList === undefined) throw "Lambdas need to be applied to something!";
    let lamIdent = lam.lambdaIdent;
    traverseTree(lam, [], (node, key) => {
	if(node !== undefined && node.ident === lamIdent) {
	    node.ident = undefined;
	    if(arg.lambda !== undefined) node.lambda = arg.lambda;
	    if(arg.ident !== undefined) node.ident = arg.ident;
	    // NOTE: not copying arg's expressionList, because that would be a self-referencing object
	    // not always, but quite often. Also you get errors if all that validation isn't there.
	}
	return node;
    });
    
    expr.expressionList = expr.expressionList.expressionList; // cuts expr.expressionList out
    // do this part whether or not arg is defined; for instance, (\y.ab) should result in ab
    if(expr.lambda.expressionList !== undefined) { 
        expr = expr.lambda.expressionList;
	append(arg.expressionList, expr);
    }
    else {
        append(expr.expressionList, expr.lambda.expressionList);
        // expr.expressionList is all the expressions in the main list except the first (since
        // it got cut out), so now expr.lambda.expressionList has the args tacked on
        expr.expressionList = expr.lambda.expressionList;
        // expr.lambda.expressionList was just used as storage basically. Now, the lambda's old
        // expressionList and the rest of the arguments are on the top level. This works whether
        // there's another lambda chained or not. 
        // The only thing left to do is clean up.
        expr.lambda = undefined;
    }
    //    console.log(`Result: ${printTree(expr)}`);
    return expr;
}
// f should be a function which takes a node and what kind of node it is as a string
function traverseTree(tree, acc, f) {
    let treeKeys = Object.keys(tree);
    treeKeys.forEach((key) => {
	if(treeTypes.includes(key) && tree[key] !== undefined) {
	    let temp = f(tree[key], key);
	    if(temp !== undefined) acc = acc.concat(temp);
	    traverseTree(tree[key], acc, f);
	}
    });
    return acc;
}
// This is a lot like traverseTree, except it resets whenever it applies the function. This is
// basically just a hack to make sure the expression gets fully evaluated. As part of the hack,
// any function that's used here will need to return a boolean indicating if it mutated the tree,
// as well as its result
function resettingTraverse(tree, f) {
    console.log(`tree: ${printTree(tree)}`);
    let doneBefore = false;
    do {
        doneBefore = false;
        let treeKeys = Object.keys(tree);
        treeKeys.forEach((key) => {
	    if(treeTypes.includes(key) && tree[key] !== undefined && !doneBefore) {
	        [doneBefore, tree[key]] = f(tree[key], key);
                if(!doneBefore) resettingTraverse(tree[key], f);
            }
        });
    } while(doneBefore);
}

function reduce(tree) {
    // This is just an abstraction in case the tree needs several steps of processing. In an earlier
    // version, it did. In this one, it looks silly, but this structure is more maintainable.
    resettingTraverse(tree, doApplications);
    return tree;
}

function parse(raw) {
    let tree;
    try {
        tree = new Tree.Tree(raw);
	reduce(tree);
	return printTree(tree);
    } catch(err) {
        return `Failed to parse! \nError: ${err}`;
    }
}

class Beta extends React.Component {
    constructor(props) {
        super(props);
        this.handleInput = this.handleInput.bind(this);
        this.toggleInfo = this.toggleInfo.bind(this);
        this.getInfo = this.getInfo.bind(this);
        this.state = {
            outText: "Type 'info' to learn about this if you haven't yet!\n",
            info: false,
        };
    }

    handleInput = function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const inForm = document.getElementById("in");
        const myFormData = inForm.value;
        inForm.value = "";
        let toAdd = myFormData;

        let low = myFormData.toLowerCase();
        if(low.startsWith("commands")) {
            toAdd = "test: runs some pre-built tests I set up to verify that everything is in order\n"
                + "info: displays a bunch of information about this console\n"
                + "commands: I hope you've figured this one out by now\n";
        } else if(low.startsWith("test")) {
            toAdd = test();
        } else if(low.startsWith("info")) {
            toAdd = "There's a lot here! This frankly took way, way too long to make. A few notes to "
                + "start. First, if you're not "
                + "familiar with the lambda calculus, you can read up on it on its wikipedia page, "
                + "which, unlike how Wikipedia handles most mathematical topics, is actually a solid "
                + "introduction.\n\n"
                + "Second, this evaluator does feature fairly robust interpretation of the "
                + "lambda calculus, but is missing symbolic substitution. This means that, for "
                + "example, (\\y.xy)x causes the y in the body to be replaced by an x, for a final "
                + "result of xx, which is wrong. If you name your variables appropriately, this "
                + "should rarely if ever be an issue, but be aware of it.\n\n"
                + "Third, my checks for malformed input are fine, but not crazy robust, so don't "
                + "expect your browser tab not to freeze if you put nonsense in, what with all the "
                + "recursion going on to make this thing work.\n\n"
                + "Finally, if you just want to get to the point, type 'test' to "
                + "see some test cases I set up which are complex and varied enough to pretty well "
                + "verify that this thing works. Otherwise, type 'commands' to get started!\n\n"
                + "Oh, and, uh, I definitely overdid this... I got just a bit obsessed. It was "
                + "a lot of fun at least!\n"; 
        } else { // doing the text that way was a pretty bad idea honestly
	    if(toAdd.length > 0) toAdd = parse(toAdd);
        }
        
        toAdd += "\n";
        
        this.setState({
            outText: toAdd + this.state.outText,
        });
        return false;
    }

    toggleInfo() {
        this.setState({
            info: !this.state.info,
        });
    }

    getInfo() {
        if(!this.state.info) return (
            <div id="hiddenInfo">
              <center>
                Click to reveal a whole bunch of non-critical info!
                <br />
                <br />
                <br />
                <br />
                <br />
                Note: 
                App.js, lambda.css, and tree.js were made by me. All but scattered fragments of the
                remainder was generated by create-react-app. 
              </center>
            </div>
        );
        else return (
            <div id="shownInfo">
              (click to hide) <br />
              This took ages. It was less than 100 hours, but more than 50; a ton of the code for this
              was insanely abstract. As I mention in the info,
              I really do not encourage such a high expectation from my future class projects. I just
              thought this would be fun to make - and while I was right, and I learned an absurd
              amount, I also dumped a crazy amount of time into it. I'm really proud of the final
              result, though. The very first result I found online for a lambda calculus evaluator 
              doesn't even correctly apply the successor function to the representation for 1! But
              this does. I'm pretty sure this will give correct answers except when alpha conversion
              is necessary.
              <br />
              <br />
              While making this, I learned:
              <ul>
                <li>how to use create-react-app</li>
                <li>how to use React</li>
                <li>a bit about CSS</li>
                <li>a lot about the methods under Object</li>
                <li>how to define a package, in practice</li>
                <li>how to define a formal grammar</li>
                <li>a lot about the lambda calculus</li>
                <li>how to use the in-browser debugger</li>
                <li>how to debug recursive functions (carefully)</li>
                <li>how to structure a program and not have it explode</li>
                <ul>
                  <li>model-view separation (the original version didn't have this, it was awful)</li>
                  <li>escape React as soon as possible, unidirectional data flow is a trap</li>
                  <li>even if you only use a function once, separation of concerns is important</li>
                  <li>write pseudocode for the tricky parts or logic errors will be frequent
                    and far more difficult to debug</li>
                  <li>don't be afraid to rewrite things that don't work</li>
                </ul>
                <li>as well as several quirks of Javascript, such as:</li>
                <ul>
                  <li>undefined is its own type, but null is an object for some reason</li>
                  <li>JS is pass by value, but objects as arguments pass references</li>
                  <li>undefined is surprisingly useful for indeterminate traversals</li>
                </ul>
              </ul>
              <br />
              This was honestly a bit of a treat. I really loved making it. 
            </div>
        );
    }
    
    render(){
        return (
            <div className="display">
              <form onSubmit={this.handleInput} action="#">
                <input
                  type="text"
                  spellCheck="false"
                  autoComplete="off"
                  id="in"
                ></input>
	        <textarea
                  spellCheck="false"
                  rows="15"
                  disabled
                  value={this.state.outText}
                  id="out"
                ></textarea>
                <input type="submit" value="heck" style={{visibility: 'hidden'}}></input>
              </form>
              <div id="info" onClick={this.toggleInfo}>
                {this.getInfo()}
              </div>
            </div>
        );
    }
}
// I hate react so much, this is so unnecessary and roundabout without any clear benefit
function Something(props) {
    if(props.enabled === "beta") {
        return (
            <div id="beta">
              <div id="collapseButton" onClick={props.collapse}>
                <div id="back">
                  {"<"}-- Go Back
                </div>
              </div>
              <Beta />
            </div>
        );
    } else {
        return (
            <div id="images">
              <center>
                <h1>Projects - Click one to get started!</h1>
                <img src="beta.png" onClick={props.onClick}
                     alt="lambda calculus interpreter"></img>
                <h1 className="mt-5" id="bottom">
                  by Caleb Spiess/Gigabitten  
                </h1>
              </center>
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.betaEnable = this.betaEnable.bind(this);
        this.collapse = this.collapse.bind(this);
        this.state = {
            enabled: "none",
        };
    }

    betaEnable() {
        this.setState({
            enabled: "beta",
        });
    }

    collapse() {
        this.setState({
            enabled: "none",
        });
    }
        
    render() {
        return (
            <div className="container-fluid app">
              <div className="row d-flex justify-content-center">
                <div className="col-sm-11 m-3">
                  <div id="choices">
                    <Something
                      collapse={this.collapse}
                      onClick={this.betaEnable}
                      enabled={this.state.enabled}
                    />
                  </div>
                </div>
              </div>
            </div>        
        );
    }
}

export default App;
