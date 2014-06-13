YUI.add('toolbar-add', function (Y) {
    'use strict';

    var Lang = Y.Lang,
        YArray = Y.Array,
        YNode = Y.Node,
        YObject = Y.Object,

    ToolbarAdd = Y.Base.create('toolbaradd', Y.Widget, [Y.WidgetPosition, Y.WidgetAutohide], {
        initializer: function() {
            var instance = this;

            instance._hideButtonsContainerFn = Y.debounce(instance._hideButtonsContainer, instance.get('hideTimeout'));

            YArray.each(
                instance.get('buttons'),
                function(item) {
                    var instanceName;

                    instanceName = instance._getButtonInstanceName(item);

                    item = Lang.isObject(item) ? item : {};

                    instance.plug(Y[instanceName], item);
                }
            );
        },

        bindUI: function() {
            var boundingBox,
                buttonsBoundingBox;

            this._addButton.on(['click', 'mouseenter'], this._showButtonsContainer, this);

            boundingBox = this.get('boundingBox');
            buttonsBoundingBox = this._buttonsOverlay.get('boundingBox');

            buttonsBoundingBox.on('mouseleave', this._handleMouseLeave, this);
            boundingBox.on('mouseleave', this._handleMouseLeave, this);

            boundingBox.on('mouseenter', this._handleMouseEnter, this);
            buttonsBoundingBox.on('mouseenter', this._handleMouseEnter, this);

            this._buttonsOverlay.on('visibleChange', this._onButtonsOverlayVisibleChange, this);
        },

        destructor: function() {
            this._addButton.destroy();

            this._buttonsOverlay.destroy();

            this._hideButtonsContainerFn.cancel();
        },

        renderUI: function() {
            this._renderAddNode();

            this._renderButtonsOverlay();
        },

        showAtPoint: function(x, y) {
            var addContentWrapperNode,
                gutter;

            this._hideButtonsContainer();

            this.show();

            addContentWrapperNode = this._addContentWrapper.getDOMNode();

            gutter = this.get('gutter');

            this.set('xy', [x - addContentWrapperNode.offsetWidth - gutter.left, y - gutter.top - addContentWrapperNode.offsetHeight/2]);
        },

        _alignButtonsContainer: function() {
            this._buttonsOverlay.align(this._addContentWrapper,
                [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.TR]);
        },

        _getButtonsContainer: function() {
            return this._buttonsContainer;
        },

        _getButtonInstanceName: function(buttonName) {
            return 'Button' + buttonName.substring(0, 1).toUpperCase() + buttonName.substring(1);
        },

        _handleMouseEnter: function() {
            this._hideButtonsContainerFn.cancel();
        },

        _handleMouseLeave: function() {
            this._hideButtonsContainerFn.cancel();

            this._hideButtonsContainerFn();
        },

        _hideButtonsContainer: function() {
            this._buttonsOverlay.hide();
        },

        _onButtonsOverlayVisibleChange: function(event) {
            if (!event.newVal) {
                YObject.each(
                    this._buttons,
                    function(item) {
                        item.set('pressed', false);
                    }
                );
            }
        },

        _renderAddNode: function() {
            var addButton,
                addNode,
                contentBox;

            addNode = YNode.create(Lang.sub(
                this.TPL_ADD, {
                    content: this.TPL_ADD_CONTENT
            }));

            addButton = new Y.Button({
                srcNode: addNode.one('.btn-add')
            }).render(addNode);

            contentBox = this.get('contentBox');

            contentBox.appendChild(addNode);

            this._addButton = addButton;

            this._addContentWrapper = this.get('contentBox').one('.add-content-wrapper');
        },

        _renderButtonsOverlay: function() {
            var buttonsContainer;

            buttonsContainer = YNode.create(this.TPL_BUTTON_CONTAINER);

            this._buttonsOverlay = new Y.Overlay({
                visible: false,
                srcNode: buttonsContainer,
                zIndex: 1
            }).render();

            this._buttonsContainer = buttonsContainer;
        },

        _showButtonsContainer: function() {
            this._buttonsOverlay.show();

            this._alignButtonsContainer();
        },

        BUTTONS_ACTIONS: {
            'image': '_handleImage',
            'code': '_handleCode'
        },

        TPL_ADD:
            '<div class="btn-group add-content-wrapper">' +
              '<button type="button" class="btn btn-add">{content}</button>' +
            '</div>',

        TPL_ADD_CONTENT: '<i class="icon-plus-sign"></i>',

        TPL_BUTTON_CONTAINER:
          '<div class="btn-group btn-group-vertical add-content"></div>'
    }, {
        ATTRS: {
            buttons: {
                validator: Lang.isArray,
                value: ['image', 'code']
            },

            buttonsContainer: {
                getter: '_getButtonsContainer',
                readOnly: true
            },

            editor: {
                validator: Lang.isObject
            },

            gutter: {
                value: {
                    left: 5,
                    top: 0
                }
            },

            hideTimeout: {
                validator: Lang.isNumber,
                value: 1000
            }
        }
    });

    Y.ToolbarAdd = ToolbarAdd;
},'0.1', {
    requires: ['widget', 'widget-position', 'widget-autohide', 'aui-debounce']
});