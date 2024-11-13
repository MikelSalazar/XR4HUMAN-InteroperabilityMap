import { KnowledgeGraph } from "../KnowledgeGraph.js";
import { Component } from "./Component.js";



/** A list of easing functions. */
export class Easing {

	/* Linear Easing. */
	static linear(t: number): number { return t; }

	/* Quadratic Easing. */
	static quadratic (t: number): number { return t * t; }

	/* Cubic Easing. */
	static cubic (t: number): number { return t * t * t; }

}

/** Defines a simple Animation. */
export class Animation {

	// ------------------------------------------------------- PROTECTED FIELDS

	/** The target of the Animation (a Component or a Node). */
	protected _target: any;

	/** The property to animate (if the target is a Component). */
	protected _property: string;

	/** The stating value of the Animation. */
	protected _startValue: number;

	/** The ending value of the Animation. */
	protected _endValue: number;

	/** The stating time of the Animation. */
	protected _startTime: number;

	/** The ending time of the Animation. */
	protected _endTime: number;

	/** Indicates if the animation should be . */
	protected _autoplay: boolean;

	/** The easing function of the Animation. */
	protected _easing: CallableFunction;

	/** The current time of the Animation */
	protected _currentTime: number;

	/** The previous time of the Animation */
	protected _previousTime: number;

	/** The previous time of the Animation */
	protected _reverse: boolean;


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Animation instance.
	 * @param target The target of the Animation (a Component or a Node).
	 * @param property The property to animate (if the target is a Component).
	 * @param startValue The stating value of the Animation.
	 * @param endValue The ending value of the Animation.
	 * @param startTime The stating time of the Animation.
	 * @param endTime The ending time of the Animation.
	 * @param easing The easing function of the Animation. */
	constructor(target: any, property: string, startValue: number, 
		endValue: number, startTime: number = 0, endTime: number = 1,
		autoplay: boolean = true, easing: CallableFunction = Easing.quadratic) {

		// Ensure that no animation operate in NodeJs
		if (KnowledgeGraph.environment == 'node') return;

		// Save the given parameters
		this._target = target; this._property = property;
		this._startValue = startValue; this._endValue = endValue;
		this._startTime = startTime; this._endTime = endTime;
		this._autoplay = autoplay; this._easing = easing;

		// If the autoplay option is active, start playing the animation.
		if (autoplay) this.play();
	}


	/** Plays the Animation. */
	play(times = 1, reverse = false) { 
		this._previousTime = undefined;

		this._reverse = reverse;

		// Starts the update process
		this.update(document.timeline.currentTime.valueOf() as number);

	}


	/** Updates the Animation. 
	 * @param time The current time of the document timeline.*/
	update(time: number) {
		time /= 1000; // Convert the time to seconds
		if (this._previousTime == undefined) 
			this._currentTime = -this._startTime;
		else this._currentTime += time - this._previousTime;  
		this._previousTime = time;
		
		// Calculate the interpolation variable [0-1]
		let interpolation = 0, duration = this._endTime - this._startTime,
			value, difference = this._endValue - this._startValue;
		if (this._currentTime <= 0) interpolation = 0;
		else if (this._currentTime < duration) {
			interpolation = (this._currentTime / duration);
			if (this._easing) interpolation = this._easing(interpolation);
		} else interpolation = 1;

		// If the animation is reversed, invert the interpolation variable
		if (this._reverse) interpolation = 1 - interpolation;

		// Calculate the interpolated value
		value = this._startValue + difference * interpolation;

		// Apply the interpolation 
		if (typeof this._target=='function') this._target(interpolation, value);
		else if (this._property != undefined)
			(this._target as Component).setAttribute(this._property, value)
		
		// Continue until the animation is finished
		if (this._currentTime < this._endTime) 
			requestAnimationFrame(this.update.bind(this));
	}
}
