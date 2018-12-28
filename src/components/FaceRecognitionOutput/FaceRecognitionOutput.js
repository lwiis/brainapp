import React from 'react';
import './FaceRecognitionOutput.css';

//const imageUrl = 'https://samples.clarifai.com/face-det.jpg';



const FaceRecognitionOutput = ({ imageUrl, boxArray }) => {
    //('boxArrayOutput: ', boxArray);
    let boxes = {}

    if (boxArray) {
        boxes = boxArray.map((box, index) =>
            <div key={index} className='bounding-box' style={{ top: box.boxTop, left: box.boxLeft, right: box.boxRight, bottom: box.boxBottom }}></div>
        );
    };

    return (
        <div className='center ma'>
            <div className='absolute mt2 '>
                <img id='outputImage' src={imageUrl} alt='' width='500px' height='auto' />
                {boxes}
            </div>
        </div>
    );


}

export default FaceRecognitionOutput