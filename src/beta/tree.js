/* by Caleb Spiess/Gigabitten
 * 
 * Excuse the wall of text, but this was like a 20 hour journey for me.
 * 
 * Honestly, this was a blast to make. old.js has my first attempt, and I tried to do this and reduce 
 * the lambda expressions at the same time, all without much of any abstraction. It was buggy and
 * horrible. I'm pretty sure I could have parsed this with a library, but I'm so happy I didn't,
 * because it showed me just how deeply valuable abstraction is. I wrote a slightly different version
 * of the formal grammar at the bottom before the terrible failure of old.js - the problem wasn't that
 * I didn't understand the structure, the problem was that I didn't understand how to structure the
 * code. I also learned a lot of small things while making this, like how to write a formal grammar
 * and how to make a basic regex. This is also the first time I've used classes as an abstraction
 * without being explicitly directed to, and I'm not sure this is what I'm supposed to use the
 * constructors for but it worked really really well. 
 * 
 * Finally, I did a revision where I simplified the structure a ton. It used to have a bunch of stuff
 * that conceptually made sense, but failed to capture the structure well enough - I eventually did
 * away with the identList abstraction and even the Expression abstraction and decided that I'd just
 * store the properties of each Expression in ExpressionList and let identifiers be expressions.
 */
class Node {
    constructor(s) {
	s = removeOuterParentheses(s);
    }
}

class Lambda extends Node {
    constructor(s) {
	super(s);
	// note: only single-argument lambdas
	let dotPos = s.indexOf(".");
	if(dotPos !== 2 || s[dotPos + 1] === undefined) throw "Malformed lambda expression!";
	let rest = s.slice(dotPos + 1);
	this.lambdaIdent = s[s.indexOf("\\") + 1];
	this.expressionList = new ExpressionList(rest);
    }
}

class ExpressionList extends Node {
    constructor(s) {
	super(s);
	let rest = "";
	let expr = s;
	[expr, rest] = extractParenthesized(s);
	if(expr[0] === "\\") {
	    this.lambda = new Lambda(expr);
	    if(rest.length > 0) this.expressionList = new ExpressionList(rest);
	}
	else {
	    this.ident = expr[0];
	    let tail = expr.slice(1) + rest;
	    if(tail.length > 0) this.expressionList = new ExpressionList(tail);
	}
    }
}

class Tree extends Node {
    constructor(s) {
	super(s);
	this.expressionList = new ExpressionList(s);
    }
}
/* deprecated after restructuring
function isIdentList(s) {
    const identReg = /([^()A-Za-z])+/;
    return !identReg.test(s);
}
*/
function removeOuterParentheses(s) {
    let prev;
    let extracted;
    do {
	prev = s;
	[extracted,] = extractParenthesized(s);
	s = s.slice(1,-1);
    } while (s === extracted);
    return prev;
}

function extractParenthesized(s, index) {
    // Finds the index of a right parenthese associated with a given left parenthese at the beginning
    // returns the original string if the first character isn't a parenthese
    // accepts 0 as a default argument for index
    if(index === undefined) index = 0;
    let depth = 0;
    if(s.charAt(index) !== "(") return [s,""];
    index++;
    let start = index;
    for(; index < s.length + 1; index++) {
        if(s.charAt(index) === ")") {
            if(depth === 0) return [s.slice(start, index),s.slice(index + 1)];
	    // the first is the parenthesized bit sans parentheses, the second is the remainder
            else {
                depth--;
            }
        }
        if(s.charAt(index) === "(") {
            depth++;
        }
    }
    throw "Mismatched parentheses!";
}

export default { Tree };
