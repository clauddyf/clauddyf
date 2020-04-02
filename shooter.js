var ShooterGame = function(config){
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var getRandom = function(min,max) {
        return Math.floor(Math.random() * (max-min + 1)) + min;
    }

    var GameObject = function(x,y,w,h){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;

        this.add = function(vec) {
            this.x += vec.x
            this.y += vec.y;
        }

        this.mult = function(fact){
            this.x *= fact;
            this.y *= fact;
        }

        this.dimension = function(width,height){
            this.width = width;
            this.height = height;
        }

        this.clone = function(){
            return new GameObject(this.x, this.y, this.width, this.height)
        }

        this.collision = function (go) {
            if(
                ((this.x + this.width) < go.x) ||
                ((this.x > (go.x + go.width)))
            ){
                return false
            } else if(
                ((this.x >= go.x) || (this.x <= (go.x + go.width))) && 
                ((go.y + go.height) < this.y)
            ){
                return false
            } else if ((this.x + this.width) >= go.x && ((this.y + this.height) >= go.y)){
                return true
            } else if ((go.x + go.width >= this.x) && ((this.y + this.height) >= go.y)){
                return true
            }
        }
    }

    var ImageManager = function(){
            this.images = {};
            var that = this;
            
            this.load = function(key,url){
                var img = new Image();
                img.onload = function(){
                    that.images[key] = img;
                }
                img.src = url;
            }
            this.get = function(key) {
                if(key in this.images){
                    return this.images[key]
                }
                return false;
            }
    }

    var imageManager = new ImageManager();
        imageManager.load('player', "images/ajasface.jpg")    //fill in the images for the file
        imageManager.load('enemy', 'images/enemy2.png')
        imageManager.load('back2', 'images/space2.jpg')
        imageManager.load('back1', 'images/stars1.jpg')

    var gameOver = false;

    var Player = function(){
            this.gameObject = new GameObject(0, canvas.height - 100, 90, 100);
            this.speed = 50
            var bullets = []
            this.update = function(status){
                // debugger
                if (KEY_STATUS.left){
                    this.gameObject.add(new GameObject(-this.speed,0,0,0))
                    if(this.gameObject.x <= 0){
                        this.gameObject.x = 0
                    }
                } else if (KEY_STATUS.right){
                    this.gameObject.add(new GameObject(this.speed, 0, 0, 0))
                    if (this.gameObject.x + this.gameObject.width >= canvas.width){
                        this.gameObject.x = canvas.width - this.gameObject.w
                    }
                } else if (KEY_STATUS.up){
                    this.gameObject.add(new GameObject(0,-this.speed, 0, 0))
                    if (this.gameObject.y + this.gameObject.height >= canvas.height){
                        this.gameObject.y = canvas.height - this.gameObject.height
                    }
                } else if (KEY_STATUS.down){
                    this.gameObject.add(new GameObject(0,this.speed, 0, 0))
                    if (this.gameObject.y >= canvas.height - this.gameObject.height) {
                        this.gameObject.y = canvas.height - this.gameObject.height
                    }
                }
                // this.gameObject.add(vec)
            }

            this.draw = function(){
                var img = imageManager.get('player');
                if(img != false){
                    context.drawImage(img, this.gameObject.x, this.gameObject.y, this.gameObject.width, this.gameObject.height)
                }
            }
    } 
        
    // new Bullet(player.gameObject, new GameObject(0, -20, 0, 0))
    var Bullet = function(startPos, speed, color){
        var isVisible = true;
        this.gameObject = startPos.clone();
        this.gameObject.add(new GameObject((this.gameObject.width)/2, (this.gameObject.height) /2)) //since its starting from 0 and negs, it may shoot up
        this.gameObject.dimension(2,15);
        this.color = color || 'pink';

        this.update = function(){
            this.gameObject.add(speed);
        }
            
        this.collision = function(go){
            return this.gameObject.collision(go.gameObject);
        }

        this.draw = function(){
            this.update();

            context.fillStyle = this.color;
            context.fillRect(this.gameObject.x, this.gameObject.y, this.gameObject.width, this.gameObject.height);
        }
    }

    var Enemy = function(speed){
            this.gameObject = new GameObject( getRandom(0, canvas.width),-20,50,50);
            this.bullets = [];
            this.collision = function(go){
                for(var i = 0; i < this.bullets.length;i++){
                    if(this.bullets[i].collision(go)){
                        return true;
                    }
                }
                return this.gameObject.collision(go.gameObject);
            }
            this.update = function(){
                // debugger
                this.gameObject.add(speed);
                if (getRandom(1,100) > 97) {
                    this.bullets.push(new Bullet(this.gameObject, new GameObject(0,10,0,0), "white"));
                }

                for(var i = this.bullets.length -1; i >= 0; i--){
                    this.bullets[i].update();

                    if(this.bullets[i].gameObject.x < 0 || this.bullets[i].gameObject.x > canvas.width || this.bullets[i].gameObject.y > canvas.height){
                        this.bullets.splice(i,1);
                    }
                }
            }
            this.draw = function(){
                this.update();

                var img = imageManager.get('enemy')

                if(img != false){
                    context.drawImage(img, this.gameObject.x, this.gameObject.y, this.gameObject.width, this.gameObject.height);
                }

                for (let i = 0; i < this.bullets.length; i++){
                    this.bullets[i].draw();
                }
            }
    }
        
    var ScoreManager = function(pos,color){
            this.score = 0;
            this.gameObject = pos;
            this.color = color || 'red';
            this.showScore = 'Score:'
            this.increment = function(){
                this.score++;
            }
            this.reset - function(){
                this.score = 0;
            }
            this.show = function(){
                context.fillStyle = '#ffffff';
                context.font = '50px Monoton, cursive';;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(this.showScore + this.score, this.gameObject.x, this.gameObject.y);
            }
    }
    var scoreManager = new ScoreManager(new GameObject(canvas.width/2,75,0,0));

    var getCanvasMouse = function(e){
            var rect = canvas.getBoundingClientRect();
            var x = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
            var y = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
            return new Vector(x,y)
    };

    var World = function(){
            var player = new Player();
            var enemies = [];
            var bullets = [];
            var lastEnemy = 0;
            var enemyTimeThreshold = 1000;
            var update = function(){
                if(lastEnemy + enemyTimeThreshold < Date.now()){
                    enemies.push(new Enemy(new GameObject(0,5,0,0)));
                    lastEnemy = Date.now();
                }

                for( var key in enemies){
                    var enemy = enemies[key];
                    if (enemy.collision(player)){
                        console.log('Game Over KEITH RUSSEL');
                        enemies[key] = null;
                        
                        gameOver = true;
                    }

                    if (enemy != null){
                        for( var bkey in bullets){
                            var bullet = bullets[bkey];
                            if(bullet != null && enemy.collision(bullet)){
                                console.log("The Enemy is Down General KJ");
                                enemies[key] = null;
                                bullets[bkey] = null;
                                scoreManager.increment();
                                break;
                            }
                        }
                    }
                }

                for(var key in enemies){
                    var enemy = enemies[key];

                    if(enemy != null && (enemy.gameObject.x < 0 || enemy.gameObject.x > canvas.width || enemy.gameObject.y > canvas.height)){
                        enemies[key] = null;
                    }
                }

                for(var key in bullets){
                    var bullet = bullets[key];

                    if(bullet != null && (bullet.gameObject.x < 0 || bullet.gameObject.x > canvas.width || bullet.gameObject.y < 0)){
                        bullets[key] = null;
                    }
                }
                enemies = enemies.filter(function(enemy){ return enemy != null;});
                bullets = bullets.filter(function(bullet){ return bullet != null;});
            }
            var clear = function(color){
                var img1 = imageManager.get('back1');
                var img2 = imageManager.get('back2');

                if(img1 != false && img2 != false){
                    
                    context.drawImage(img1, 0, 0, canvas.width, canvas.width)
                    context.drawImage(img2,0,0,canvas.width,canvas.width);
                }
            }

            var draw = function(){
                // debugger
                update();

                clear('green');

                player.draw();

                for( var enemy of enemies){
                    enemy.draw();
                }

                for(var bullet of bullets){
                    bullet.draw();
                }

                scoreManager.show();

                if(!gameOver){
                    setTimeout(draw, 1000/30)
                }
            }

            draw();

            KEY_CODES = {
                32: 'space',
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down'
                // 32: 'space',
                // 65: 'left',
                // 119: 'up',
                // 83: 'right',
                // 122: 'down',
                // 97: 'left',
                // 119: 'up',
                // 115: 'right',
                // 122: 'down',

            }
            KEY_STATUS = {};
            for(code in KEY_CODES){
                KEY_STATUS[KEY_CODES[code]] = false;
            }

            // window.addEventListener('keypress', function(e){
            //     var code = e.keyCode || e.charCode
            //     debugger
            //     // var keyCode = (e.keyCode) ? e.keyCode : e.charCode
            //     // var keyCode = (e.keyCode || e.charCode)
            //     switch(code){
            //         case 32: bullets.push(new Bullet(player.gameObject, new GameObject(0,-20,0,0)));
            //         // case (97 || 119 || 115 || 122): player.update(KEY_STATUS[KEY_CODES[keyCode]] = true);
            //         // case 37: player.update(KEY_STATUS[KEY_CODES[keyCode]] = true);
            //         // case 38: player.update(KEY_STATUS[KEY_CODES[keyCode]] = true);
            //         // case 39: player.update(KEY_STATUS[KEY_CODES[keyCode]] = true);
            //         // case 40: player.update(KEY_STATUS[KEY_CODES[keyCode]] = true);
            //         break;
            //     }
            // });

            // var lastX = 0;
            // canvas.addEventListener('mousemove', function(e){
            //     var x = e.clientX;

            //     player.update(new GameObject(x- lastX,0,0,0));
            //     lastX = x;
            // });

            window.addEventListener('keydown',function(e){
                // debugger
                var keyCode = (e.keyCode) ? e.keyCode : e.charCode
                if (KEY_CODES[keyCode] === 'space'){
                    bullets.push(new Bullet(player.gameObject, new GameObject(0, -20, 0, 0)))
                }
                else{
                    e.preventDefault();
                    player.update(KEY_STATUS[KEY_CODES[keyCode]] = true);
                }
            });
            window.addEventListener('keyup', function (e) {
                var keyCode = (e.keyCode) ? e.keyCode : e.charCode
                if (KEY_CODES[keyCode] === 'space') {
                    bullets.push(new Bullet(player.gameObject, new GameObject(0, -20, 0, 0)))
                }
                else{
                    e.preventDefault();
                    KEY_STATUS[KEY_CODES[keyCode]] = false;
                }
            });

            // canvas.addEventListener('mousedown', function(e){
            //     bullets.push(new Bullet(player.gameObject, new GameObject(0,-20,0,0)));
            // });
    }

    World();
    // debugger
    // document.body.appendChild(canvas); 
    document.getElementById('shooting-area').appendChild(canvas)
    // document.querySelectorAll('.shooting-area').appendChild(canvas)
}

ShooterGame();