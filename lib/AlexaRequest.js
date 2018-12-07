// Copyright 2017, Peter Ullrich. dotup IT solutions
class AlexaRequest {
	get [Symbol.toStringTag]() {
    return 'AlexaRequest';
  }
	get Version() { return this.version; }
	set Version(value) { this.version = value; }

	get Session() { return this.session; }
	set Session(value) { this.session = value; }

	get Context() { return this.context; }
	set Context(value) { this.context = value; }

	get Request() { return this.request; }
	set Request(value) { this.request = value; }

	get SystemState(){return this.systemState;}

	get IsLaunched(){return this.systemState.isLaunched;}

	get IsNewSession() {
		if (!this.session)
			return false;
		if (!this.session.new)
			return false;
		return this.session.new;
	}
	
	Translate(key) {
		return key;
	}

	GetSlots() {
		if (this.Request.intent && this.Request.intent.slots)
			return this.Request.intent.slots;
		else
			return null;
	}

	GetSlot(slotname) {
		var slots = this.GetSlots();
		if (slots)
			return slots[slotname];
		else
			return null;
	}

	GetSlotValue(slotname, defaultValue) {
		var slot = this.GetSlot(slotname);
		if (slot && slot.value && slot.value !== '?')
			return slot.value;
		else
			return defaultValue === undefined ? null : defaultValue();
	}
}

module.exports = AlexaRequest;