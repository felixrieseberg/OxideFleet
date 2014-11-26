var TaggingComponent = Ember.Component.extend({
    didInsertElement: function () {
        this.$('input').selectize({
            plugins: ['remove_button'],
            delimiter: ',',
            persist: false,

            create: function (input) {
                return {
                    value: input,
                    text: input
                };
            }
        });

        this.selectize = this.$('input')[0].selectize;
    },

    willDestroyElement: function () {
        this.selectize.destroy();
    }
});

export default TaggingComponent;
