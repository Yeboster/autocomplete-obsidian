import {Provider} from './provider'
export default class LaTexProvider extends Provider {
    category = "L"
    completions = ["\\Arrowvert", "\\Bbbk", "\\Big", "\\Bigg", "\\Biggl", "\\Biggr", "\\Bigl", "\\Bigm", "\\Bigr", "\\Box", "\\Bumpeq", "\\Cap", "\\cite[#{}]{#{}}", "\\cite", "\\Cup", "\\DeclareMathOperator{#{}}{#{}}", "\\Delta", "\\Downarrow", "\\Finv", "\\Game", "\\Gamma", "\\Im", "\\Lambda", "\\Leftarrow", "\\Leftrightarrow", "\\Lleftarrow", "\\Longleftarrow", "\\Longleftrightarrow", "\\Longrightarrow", "\\Lsh", "\\Omega", "\\Phi", "\\Pi", "\\Pr", "\\Psi", "\\Re", "\\Rightarrow", "\\Rrightarrow", "\\Rsh", "\\S", "\\Sigma", "\\Subset", "\\Supset", "\\TeX", "\\Theta", "\\Uparrow", "\\Updownarrow", "\\Upsilon", "\\Vdash", "\\Vert", "\\Vvdash", "\\Xi", "\\above", "\\abovewithdelims", "\\acute{#{}}", "\\aleph", "\\alpha", "\\amalg", "\\angle", "\\approx", "\\approxeq", "\\arccos", "\\arcsin", "\\arctan", "\\arg", "\\arrowvert", "\\ast", "\\asymp", "\\atop",
        "\\atopwithdelims", "\\backepsilon", "\\backprime", "\\backsim", "\\backsimeq", "\\backslash", "\\bar{#{}}", "\\barwedge", "\\because", "\\beta", "\\beth", "\\between", "\\bf", "\\big", "\\bigcap", "\\bigcirc", "\\bigcup", "\\bigg", "\\biggl", "\\biggm", "\\biggr", "\\bigl", "\\bigm", "\\bigodot", "\\bigoplus", "\\bigotimes", "\\bigr\\}", "\\bigsqcup", "\\bigstar", "\\bigtriangledown", "\\bigtriangleup", "\\biguplus", "\\bigvee", "\\bigwedge", "\\binom{#{}}{#{}}", "\\blacklozenge", "\\blacksquare", "\\blacktriangle", "\\blacktriangledown", "\\blacktriangleleft", "\\blacktriangleright", "\\bmod", "\\boldsymbol{#{}}", "\\bot", "\\bowtie", "\\boxdot", "\\boxed{#{}}", "\\boxminus", "\\boxplus", "\\boxtimes", "\\brace", "\\bracevert", "\\brack", "\\breve{#{}}", "\\buildrel", "\\bullet", "\\bumpeq", "\\cal", "\\cap", "\\cases{#{}}", "\\cdot", "\\cdotp", "\\cdots",
        "\\centerdot", "\\cfrac{#{}}{#{}}", "\\check{#{}}", "\\checkmark", "\\chi", "\\choose", "\\circ", "\\circeq", "\\circlearrowleft", "\\circlearrowright", "\\circledS", "\\circledast", "\\circledcirc", "\\circleddash", "\\clubsuit", "\\colon", "\\complement", "\\cong", "\\coprod", "\\cos", "\\cosh", "\\cot", "\\coth", "\\cr", "\\csc", "\\cup", "\\curlyeqprec", "\\curlyeqsucc", "\\curlyvee", "\\curlywedge", "\\curvearrowleft", "\\curvearrowright", "\\dagger", "\\daleth", "\\dashleftarrow", "\\dashrightarrow", "\\dashv", "\\dbinom{#{}}{#{}}", "\\ddagger", "\\ddddot{#{}}", "\\dddot{#{}}", "\\ddot{#{}}", "\\ddots", "\\def", "\\deg", "\\delta", "\\det", "\\dfrac{#{}}{#{}}", "\\diagdown", "\\diagup", "\\diamond", "\\diamondsuit", "\\digamma", "\\dim", "\\displaylines", "\\displaystyle", "\\div", "\\divideontimes", "\\dot{#{}}", "\\doteq", "\\doteqdot", "\\dotplus",
        "\\dots", "\\dotsb", "\\dotsc", "\\dotsi", "\\dotsm", "\\dotso", "\\doublebarwedge", "\\downarrow", "\\downdownarrows", "\\downharpoonleft", "\\downharpoonright", "\\ell", "\\emptyset", "\\enspace", "\\epsilon", "\\eqalign{#{}}", "\\eqalignno{#{}}", "\\eqcirc", "\\eqref{#{}}", "\\eqsim", "\\eqslantgtr", "\\eqslantless", "\\equiv", "\\eta", "\\eth", "\\exists", "\\exp", "\\fallingdotseq", "\\flat", "\\forall", "\\frown", "\\gamma", "\\gcd", "\\ge", "\\geq", "\\geqq", "\\geqslant", "\\gets", "\\gg", "\\ggg", "\\gimel", "\\gnapprox", "\\gneq", "\\gneqq", "\\gnsim", "\\grave{#{}}", "\\gtrapprox", "\\gtrdot", "\\gtreqless", "\\gtreqqless", "\\gtrless", "\\gtrsim", "\\gvertneqq", "\\hat{#{}}", "\\hbar", "\\hbox", "\\heartsuit", "\\hfil", "\\hfill", "\\hom", "\\hookleftarrow", "\\hookrightarrow", "\\hphantom{#{}}", "\\hskip", "\\hslash", "\\idotsint", "\\iff",
        "\\iiiint", "\\iiint", "\\iint", "\\imath", "\\impliedby", "\\implies", "\\in", "\\inf", "\\infty", "\\injlim", "\\int\\limits_{#{}}^{#{}}", "\\intercal", "\\iota", "\\it", "\\jmath", "\\kappa", "\\ker", "\\kern", "\\lVert", "\\lambda", "\\land", "\\langle", "\\lbrace", "\\lbrack", "\\lceil", "\\ldotp", "\\ldots", "\\le", "\\left", "\\leftarrow", "\\leftarrowtail", "\\leftharpoondown", "\\leftharpoonup", "\\leftleftarrows", "\\leftrightarrow", "\\leftrightarrows", "\\leftrightharpoons", "\\leftrightsquigarrow", "\\leftroot{#{}}", "\\leftthreetimes", "\\leq", "\\leqalignno{#{}}", "\\leqq", "\\leqslant", "\\lessapprox", "\\lessdot", "\\lesseqgtr", "\\lesseqqgtr", "\\lessgtr", "\\lesssim", "\\let{#{}}{#{}}", "\\lfloor", "\\lg", "\\lgroup", "\\lhd", "\\lim", "\\liminf", "\\limits_{#{}}^{#{}}", "\\limsup", "\\ll", "\\llap{#{}}", "\\llcorner", "\\lll", "\\lmoustache",
        "\\ln", "\\lnapprox", "\\lneq", "\\lneqq", "\\lnot", "\\lnsim", "\\log", "\\longleftarrow", "\\longleftrightarrow", "\\longmapsto", "\\longrightarrow", "\\looparrowleft", "\\looparrowright", "\\lor", "\\lower", "\\lozenge", "\\lrcorner", "\\ltimes", "\\lvert", "\\lvertneqq", "\\maltese", "\\mapsto", "\\mathbb{#{}}", "\\mathbf{#{}}", "\\mathbin", "\\mathcal{#{}}", "\\mathchoice", "\\mathclose", "\\mathfrak{#{}}", "\\mathinner", "\\mathop", "\\mathopen", "\\mathord", "\\mathpunct", "\\mathrel", "\\mathstrut", "\\matrix{#{}}", "\\max", "\\measuredangle", "\\mho", "\\mid", "\\middle", "\\min", "\\mit", "\\mkern", "\\mod", "\\models", "\\moveleft", "\\moveright", "\\mp", "\\mskip", "\\mspace{#{}}", "\\mu", "\\multimap", "\\nLeftarrow", "\\nLeftrightarrow", "\\nRightarrow", "\\nVDash", "\\nVdash", "\\nabla", "\\natural", "\\ncong", "\\ne", "\\nearrow", "\\neg", "\\negmedspace",
        "\\negthickspace", "\\negthinspace", "\\neq", "\\nexists", "\\ngeq", "\\ngeqq", "\\ngeqslant", "\\ngtr", "\\ni", "\\nleftarrow", "\\nleftrightarrow", "\\nleq", "\\nleqq", "\\nleqslant", "\\nless", "\\nmid", "\\nolimits_{#{}}^{#{}}", "\\not", "\\notag", "\\notin", "\\nparallel", "\\nprec", "\\npreceq", "\\nrightarrow", "\\nshortmid", "\\nshortparallel", "\\nsim", "\\nsubseteq", "\\nsubseteqq", "\\nsucc", "\\nsucceq", "\\nsupseteq", "\\nsupseteqq", "\\ntriangleleft", "\\ntrianglelefteq", "\\ntriangleright", "\\ntrianglerighteq", "\\nu", "\\nvDash", "\\nvdash", "\\nwarrow", "\\odot", "\\oint", "\\oldstyle", "\\omega", "\\ominus", "\\operatorname{#{}}", "\\oplus", "\\oslash", "\\otimes", "\\over", "\\overbrace{#{}}", "\\overleftarrow{#{}}", "\\overleftrightarrow{#{}}", "\\overline{#{}}", "\\overrightarrow{#{}}", "\\overset{#{}}{#{}}", "\\overwithdelims", "\\owns",
        "\\parallel", "\\partial", "\\perp", "\\phantom{#{}}", "\\phi", "\\pi", "\\pitchfork", "\\pm", "\\pmatrix{#{}}", "\\pmb{#{}}", "\\pmod", "\\pod", "\\prec", "\\precapprox", "\\preccurlyeq", "\\preceq", "\\precnapprox", "\\precneqq", "\\precnsim", "\\precsim", "\\prime", "\\prod\\limits_{#{}}^{#{}}", "\\projlim", "\\propto", "\\psi", "\\qquad", "\\quad", "\\rVert", "\\raise", "\\rangle", "\\rbrace", "\\rbrack", "\\rceil", "\\rfloor", "\\rgroup", "\\rhd", "\\rho", "\\right", "\\rightarrow", "\\rightarrowtail", "\\rightharpoondown", "\\rightharpoonup", "\\rightleftarrows", "\\rightleftharpoons", "\\rightrightarrows", "\\rightsquigarrow", "\\rightthreetimes", "\\risingdotseq", "\\rlap{#{}}", "\\rm", "\\rmoustache", "\\root #{} \\of #{}", "\\rtimes", "\\rvert", "\\scriptscriptstyle", "\\scriptstyle", "\\searrow", "\\sec", "\\setminus", "\\sharp", "\\shortmid",
        "\\shortparallel", "\\sideset{#{}}{#{}}{#{}}", "\\sigma", "\\sim", "\\simeq", "\\sin", "\\sinh", "\\skew{#{}}{#{}}{#{}}", "\\smallfrown", "\\smallint", "\\smallsetminus", "\\smallsmile", "\\smash{#{}}", "\\smile", "\\space", "\\spadesuit", "\\sphericalangle", "\\sqcap", "\\sqcup", "\\sqrt{#{}}", "\\sqsubset", "\\sqsubseteq", "\\sqsupset", "\\sqsupseteq", "\\square", "\\star", "\\strut", "\\subset", "\\subseteq", "\\subseteqq", "\\subsetneq", "\\subsetneqq", "\\substack{#{}}", "\\succ", "\\succapprox", "\\succcurlyeq", "\\succeq", "\\succnapprox", "\\succneqq", "\\succnsim", "\\succsim", "\\sum\\limits_{#{}}^{#{}}", "\\sup", "\\supset", "\\supseteq", "\\supseteqq", "\\supsetneq", "\\supsetneqq", "\\surd", "\\swarrow", "\\tag{#{}}", "\\tan", "\\tanh", "\\tau", "\\tbinom{#{}}{#{}}", "\\text{#{}}", "\\textstyle", "\\tfrac{#{}}{#{}}", "\\therefore", "\\theta",
        "\\thickapprox", "\\thicksim", "\\thinspace", "\\tilde{#{}}", "\\times", "\\to", "\\top", "\\triangle", "\\triangledown", "\\triangleleft", "\\trianglelefteq", "\\triangleq", "\\triangleright", "\\trianglerighteq", "\\tt", "\\twoheadleftarrow", "\\twoheadrightarrow", "\\ulcorner", "\\underbrace{#{}}", "\\underleftarrow{#{}}", "\\underleftrightarrow{#{}}", "\\underline{#{}}", "\\underrightarrow{#{}}", "\\underset{#{}}{#{}}", "\\unlhd", "\\unrhd", "\\uparrow", "\\updownarrow", "\\upharpoonleft", "\\upharpoonright", "\\uplus", "\\uproot{#{}}", "\\upsilon", "\\upuparrows", "\\urcorner", "\\vDash", "\\varDelta", "\\varGamma", "\\varLambda", "\\varOmega", "\\varPhi", "\\varPi", "\\varPsi", "\\varSigma", "\\varTheta", "\\varUpsilon", "\\varXi", "\\varepsilon", "\\varinjlim", "\\varkappa", "\\varliminf", "\\varlimsup", "\\varnothing", "\\varphi", "\\varpi",
        "\\varprojlim", "\\varpropto", "\\varrho", "\\varsigma", "\\varsubsetneq", "\\varsubsetneqq", "\\varsupsetneq", "\\varsupsetneqq", "\\vartheta", "\\vartriangle", "\\vartriangleleft", "\\vartriangleright", "\\vcenter", "\\vdash", "\\vec{#{}}", "\\vee", "\\veebar", "\\vert", "\\vphantom{#{}}", "\\wedge", "\\widehat{#{}}", "\\widetilde{#{}}", "\\wp", "\\wr", "\\xi", "\\xleftarrow{#{}}", "\\xrightarrow{#{}}", "\\zeta", "\\begin{definition}", "\\begin{tikzcd}", "\\begin{tikzpicture}", "\\begin{align}", "\\begin{align*}", "\\begin{alignat}", "\\begin{alignat*}", "\\begin{aligned}", "\\begin{alignedat}", "\\begin{array}", "\\begin{Bmatrix}", "\\begin{bmatrix}", "\\begin{cases}", "\\begin{CD}", "\\begin{eqnarray}", "\\begin{eqnarray*}", "\\begin{equation}", "\\begin{equation*}", "\\begin{gather}", "\\begin{gather*}", "\\begin{gathered}", "\\begin{matrix}",
        "\\begin{multline}", "\\begin{multline*}", "\\begin{pmatrix}", "\\begin{smallmatrix}", "\\begin{split}", "\\begin{subarray}", "\\begin{Vmatrix}", "\\begin{vmatrix}"]
}
