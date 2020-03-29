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

        this.collision = function(go){
            return !(go.x > this.x + this.width) ||
            go.x + go.width < this.x ||
            go.y > this.y + this.height ||
            go.y + go.height < this.y;
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
        imageManager.load('player', "images/kjsface.jpg")    //fill in the images for the file
        imageManager.load('enemy', 'images/enemy.jpg')
        imageManager.load('back2', 'images/stars1.jpg')
        imageManager.load('back1', 'images/stars2.jpg')

        var gameOver = false;

        var Player = function(){
            this.gameObject = new GameObject(0, canvas.height - 100, 90, 100);

            this.update = function(vec){
                this.gameObject.add(vec)
            }

            this.draw = function(){
                var img = imageManager.get('player');
                if(img != false){
                    context.drawImage(img, this.gameObject.x, this.gameObject.y, this.gameObject.width, this.gameObject.height)
                }
            }
        }
        

        var Bullet = function(startPos, speed, color){
            var isVisible = true;
            this.gameObject = startPos.clone();
            this.gameObject.add(new GameObject((this.gameObject.width)/2, (this.gameObject.height) /2))
            this.gameObject.dimension(1,10);
            this.color = color || 'red';

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
                this.gameObject.add(speed);

                if (getRandom(1,100) > 97) {
                    this.bullets.push(new Bullet(this.gameObject, new GameObject(0,10,0,0), "blue"));
                }

                for(var i = this.bullets.length -1; i >= 0; i--){
                    this.bullets[i].update();

                    if(this.bullets[i].gameObject.x >0 || this.bullets[i].gameObject.x > canvas.width || this.bullets[i].gameObject.y > canvas.height){
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

            this.increment = function(){
                this.score++;
            }
            this.reset - function(){
                this.score = 0;
            }
            this.show = function(){
                context.fillStyle = '#ffffff';
                context.font='50px Georgia';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(this.score, this.gameObject.x, this.gameObject.y);
            }
        }
        var scoreManager = new ScoreManager(new GameObject(canvas.width/2,50,0,0));
        /**  
         *
         * 
         * 
         * 
        **/

        
        var getCanvasMouse = function(e){
            debugger
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

                    if(enemy != null && (eney.gameObject.x < 0 || enemy.gameObject.x > canvas.width || enemy.gameObject.y > canvas.height)){
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
                    context.drawImage(img1,0,0,canvas.width,canvas.width);
                    context.drawImage(img2,0,0,canvas.width,canvas.width);
                }
            }

            var draw = function(){
                update();

                clear('black');

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

            window.addEventListener('keypress', function(e){
                var code = e.keyCode || e.charCode
                switch(code){
                    case 32: bullets.push(new Bullet(player.gameObject, new GameObject(0,-20,0,0)));
                    break;
                }
            });

            var lastX = 0;
            canvas.addEventListener('mousemove', function(e){
                var x = e.clientX;

                player.update(new GameObject(x- lastX,0,0,0));
                lastX = x;
            });

            canvas.addEventListener('mousedown', function(e){
                bullets.push(new Bullet(player.gameObject, new GameObject(0,-20,0,0)));
            });
        }

        World();

        document.body.appendChild(canvas);
}

ShooterGame();