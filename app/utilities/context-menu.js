import Ember from 'ember';
import config from '../config/environment';

function Menu() {
    var gui = window.requireNode('nw.gui');
    var menu = new gui.Menu();

    // Commands
    var cut = new gui.MenuItem({
        label: 'Cut',
        click: function () {
            document.execCommand('cut');
        }
    });
    var copy = new gui.MenuItem({
        label: 'Copy',
        click: function () {
            document.execCommand('copy');
        }
    });
    var paste = new gui.MenuItem({
        label: 'Paste',
        click: function () {
            document.execCommand('paste');
        }
    });
    var emberInspector = new gui.MenuItem({
        label: 'Ember Inspector',
        click: function () {
            var s = document.createElement('script');
            s.src = 'http://ember-extension.s3.amazonaws.com/dist_bookmarklet/load_inspector.js';
            document.body.appendChild(s);
        }
    });

    menu.append(cut);
    menu.append(copy);
    menu.append(paste);

    if (config.environment === 'development') {
        menu.append(emberInspector);
    }

    return menu;
}

var contextMenu = {
    setup: function () {
        var menu = new Menu();

        Ember.$(document).on('contextmenu', function (e) {
            e.preventDefault();
            menu.popup(e.originalEvent.x, e.originalEvent.y);
        });
    }
};

export default contextMenu;
