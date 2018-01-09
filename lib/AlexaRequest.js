class AlexaRequest{
	get Version(){ return this.version;}
	set Version(value){ this.version = value;}
	
	get Session(){ return this.session;}
	set Session(value){ this.session = value;}
	
	get Context(){ return this.context;}
	set Context(value){ this.context = value;}
	
	get Request(){ return this.request;}
	set Request(value){ this.request = value;}

	Translate(key){
return key;
	}

	GetSlots() {
		if (this.Request.intent && this.Request.intent.slots)
			return this.Request.intent.slots;
		else
			return null;
	}

	GetSlot(slotname) {
		var slots = aw.GetSlots();
		if (slots)
			return slots[slotname];
		else
			return null;
	}

	GetSlotValue(slotname, defaultValue) {
		var slot = aw.GetSlot(slotname);
		if (slot && slot.value)
			return slot.value;
		else
			return defaultValue === null ? null : defaultValue();
	}
}

module.exports = AlexaRequest;