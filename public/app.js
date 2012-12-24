;(function(){
  var Drawing = {};

  Drawing.CANVAS_WIDTH = 800;
  Drawing.CANVAS_HEIGHT = 600;

  Drawing.init = function() {
    // the html container.
    this.html = $("#whiteboard");

    // the canvas must exist on DOM or the Whiteboard
    // component won't be able to detects its dimension.
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.CANVAS_WIDTH;
    this.canvas.height = this.CANVAS_HEIGHT;
    this.html.append(this.canvas);

    // initialize the whiteboard component.
    this.whiteboard = new Whiteboard(this.canvas);

    // initialize the save button.
    this.saveButton = new Drawing.SaveButton(
        window
      , $(".save")
      , this.canvas
    );

    // initialize the reset button.
    this.resetButton = new Drawing.ResetButton(
        this.whiteboard
      , $(".reset")
    );

    // initialize the color button toolbar.
    this.colorToolbar = new Drawing.ColorButtonToolbar(
        this.whiteboard
      , $(".color")
    );

    // initialize the Socket.IO connection.
    this.connection = new Drawing.Connection(location);

    // initialize the drawing events coordinator.
    this.broadcast = new Drawing.Coordinator(
        this.connection
      , this.whiteboard
    );

    // initialize the whiteboard.
    this.whiteboard.init();
  };

  //========================================================
  // Drawing.Connection
  //========================================================
  Drawing.Connection = function(location) {
    this.location = location;
    this.uri = "http://" + location.host;
    this.socket = io.connect(this.uri);

    // Proxies these functions, so we don't violate
    // the encapsulation.
    this.on = this.socket.on.bind(this.socket);
    this.emit = this.socket.emit.bind(this.socket);
  };

  //========================================================
  // Drawing.Coordinator
  //========================================================
  Drawing.Coordinator = function(connection, whiteboard) {
    this.connection = connection;
    this.whiteboard = whiteboard;

    this.addEventListeners();
  };

  Drawing.Coordinator.prototype.addEventListeners = function() {
    this.connection.on("draw", this.draw.bind(this));
    this.whiteboard.on("move", this.emitDrawing.bind(this));
  };

  Drawing.Coordinator.prototype.draw = function(info) {
    this.whiteboard.draw(
        info.from
      , info.to
      , info.lineColor
      , info.lineWidth
    );
  };

  Drawing.Coordinator.prototype.emitDrawing = function(coords) {
    if (!this.whiteboard.isDrawing) {
      return;
    }

    this.connection.emit("draw", {
        from: this.whiteboard.history
      , to: coords
      , lineWidth: this.whiteboard.lineWidth
      , lineColor: this.whiteboard.lineColor
    });
  };

  //========================================================
  // Drawing.ColorButtonToolbar
  //========================================================
  Drawing.ColorButtonToolbar = function(whiteboard, buttons) {
    this.buttons = buttons;
    this.whiteboard = whiteboard;

    this.addEventListeners();
    this.renderBackground();
  };

  Drawing.ColorButtonToolbar.prototype.addEventListeners = function() {
    this.buttons
      .on("click", this.onActivate.bind(this))
      .on("touchstart", this.onActivate.bind(this))
    ;
  };

  Drawing.ColorButtonToolbar.prototype.onActivate = function(event) {
    var button = $(event.target);

    this.buttons.removeClass("active");
    button.addClass("active");

    this.whiteboard.lineColor = button.data("color");
    this.whiteboard.lineWidth = button.data("width");
  };

  Drawing.ColorButtonToolbar.prototype.renderBackground = function() {
    this.buttons.each(function(){
      $(this).css({
        background: $(this).data("color")
      });
    });
  };

  //========================================================
  // Drawing.ResetButton
  //========================================================
  Drawing.ResetButton = function(whiteboard, button) {
    this.button = button;
    this.whiteboard = whiteboard;

    this.addEventListeners();
  };

  Drawing.ResetButton.prototype.addEventListeners = function() {
    this.button
      .on("click", this.reset.bind(this))
      .on("touchstart", this.reset.bind(this))
  };

  Drawing.ResetButton.prototype.reset = function() {
    this.whiteboard.reset();
  };

  //========================================================
  // Drawing.SaveButton
  //========================================================
  Drawing.SaveButton = function(window, button, canvas) {
    this.window = window;
    this.button = button;
    this.canvas = canvas;

    this.addEventListeners();
  };

  Drawing.SaveButton.prototype.addEventListeners = function() {
    this.button.on("click", this.onClick.bind(this));
  };

  Drawing.SaveButton.prototype.onClick = function(event) {
    this.window.open(this.canvas.toDataURL("image/png"));
  };

  //========================================================
  // Initialize all the things!
  //========================================================
  Drawing.init();
})();
