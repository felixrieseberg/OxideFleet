var transition = function () {
    this.transition(
        this.fromRoute('login'),
        this.toRoute('dashboard'),
        this.use('toLeft'),
        this.reverse('toRight')
    );
};

export default transition;
