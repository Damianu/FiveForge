/*
    >>> CLASS <<<
*/
class FFTrait extends FFElement
{
    get template()
    {
        return "trait"
    }
}
/*
    >>> SETUP <<<
*/
FFTrait.setupType("Trait");
FFTrait.registerAttribute("source","Source","text", "")