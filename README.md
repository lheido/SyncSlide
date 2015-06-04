# SyncSlide
Synchronized slide presentation based on node.js

## How to use
First, run syncSlide.js :
```
node syncSlide.js
```

And define viewer and controller template (using the same slides for each).

On viewer, create an instance of SyncViewer:
```javascript
var viewer = new SyncViewer();
```

The same thing with the controller:
```javascript
var controller = new SyncController();
```
Minimum html:
```html
<body>
    <div class="content">
        <div class="slide">
            <div class="slide-content">
                First slide content...
            </div>
        </div>
        <div class="slide">
            <div class="slide-content">
                Other slide content...
            </div>
        </div>
    </div>
</body>
```
## More control with options
If you want define other behaviors or override them, passing options to the
contructor, basic example:
```javascript
var options = {
    events: {
        onTap: function(evt, index) {...},
        onSwipeLeft: function(evt) {...},
        onSwipeRight: function(evt) {...},
        onPan: function(evt) {...},
        otherSocketEvent: function(evt, moreArguments){...}
    }
    hammer: {
        '.content': {
            swipeleft: function(evt, index){...},
            swiperight: function(evt, index){...},
            otherHammerEvent: function(evt, index){...}
        },
        '.tap': {
            tap: function(evt, index){...},
            otherHammerEvent: function(evt, index){...}
        }
    }
}
```
Make sure to use the same events options on both side, viewer and controller.