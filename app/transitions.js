var transition = function () {
    this.transition(
        this.fromRoute('welcome'),
        this.toRoute('explorer'),
        this.use('toLeft'),
        this.reverse('toRight')
    );
};

export default transition;
