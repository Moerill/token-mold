export class TokenMoldRule {
    priority = -1; //A negative priority means this rule needs to be placed *last*
    active = true; //Rules can be disabled, rather than deleting them

    name = 'Token Mold Rule';
    
    /* Token Rules*/
    affectLinked = false;

    dispositionRule = {
        active: false,
        friendly: false,
        neutral: false,
        hostile: false
    }

    name = {
        active: false
    }

    configID = null;

    constructor(defaults = {}) {
        mergeObject(this, defaults, {insertKeys: false});
    }
}