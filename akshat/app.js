function initializeCanvas() {
    const canvas = document.getElementById('live2d-canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    // Resize canvas based on window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Load model configuration
    fetch('hiyori_free_en/runtime/hiyori_free_t08.model3.json')
        .then(response => response.json())
        .then(data => {
            const modelUrl = 'hiyori_free_en/runtime/hiyori_free_t08.moc3';
            const textureUrl = 'hiyori_free_en/runtime/hiyori_free_t08.2048/texture_00.png';

            // Load the model binary (MOC3)
            fetch(modelUrl)
                .then(response => response.arrayBuffer())
                .then(buffer => {
                    console.log("Live2D Cubism Core initialized");

                    // Create the Moc object
                    const moc = new Live2DCubismCore.Moc(new Uint8Array(buffer));
                    const live2DModel = new Live2DCubismCore.Model(moc);

                    if (live2DModel) {
                        console.log("Model loaded successfully");

                        // Load and bind texture
                        loadTexture(textureUrl, gl)
                            .then(texture => {
                                console.log("Texture loaded successfully");

                                // Pass the WebGL context and texture to the render function
                                renderModel(live2DModel, gl, texture);
                            })
                            .catch(err => console.error("Error loading texture:", err));
                    } else {
                        console.error("Failed to create Live2D model");
                    }
                })
                .catch(err => console.error("Error loading moc file:", err));
        })
        .catch(err => console.error("Error loading model configuration:", err));
}

function loadTexture(url, gl) {
    return new Promise((resolve, reject) => {
        const texture = gl.createTexture();
        const image = new Image();

        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            resolve(texture);
        };

        image.onerror = () => reject(new Error("Failed to load texture: " + url));
        image.src = url;
    });
}
function renderModel(model, gl, texture) {
    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const shaderProgram = createShaderProgram(gl);
    gl.useProgram(shaderProgram);

    // Bind the texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const uTextureLocation = gl.getUniformLocation(shaderProgram, 'u_texture');
    gl.uniform1i(uTextureLocation, 0);

    // Prepare buffers
    const vertexBuffer = gl.createBuffer();
    const uvBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();

    // Animation loop
    function animate() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        const drawableCount = model.getDrawableCount();

        for (let i = 0; i < drawableCount; i++) {
            const vertices = model.getDrawableVertices(i); // Retrieve vertices for drawable i
            const uvs = model.getDrawableVertexUvs(i);     // Retrieve UVs for drawable i
            const indices = model.getDrawableIndices(i);   // Retrieve indices for drawable i

            if (!vertices || !uvs || !indices) {
                console.error(`Drawable ${i} data is missing`);
                continue;
            }

            // Bind vertex buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            const positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            // Bind UV buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
            const texCoordLocation = gl.getAttribLocation(shaderProgram, 'a_texCoord');
            gl.enableVertexAttribArray(texCoordLocation);
            gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

            // Bind index buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

            // Draw the model
            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        }

        requestAnimationFrame(animate); // Continue the animation loop
    }

    animate();
}

function createShaderProgram(gl) {
    const vertexShaderSource = `
        attribute vec4 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;

        void main() {
            gl_Position = a_position;
            v_texCoord = a_texCoord;
        }
    `;
    const fragmentShaderSource = `
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_texture;

        void main() {
            gl_FragColor = texture2D(u_texture, v_texCoord);
        }
    `;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error("Shader program failed to link:", gl.getProgramInfoLog(shaderProgram));
    }

    return shaderProgram;
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation failed:", gl.getShaderInfoLog(shader));
    }

    return shader;
}

initializeCanvas();
