The RgbaInput should work as follows:
1. It should start showing a placeholder text "rgba(255, 0, 0, 1)"
2. When the user start writing input the placeholder should disappear and the input should be shown.
3. The input should be give with 3.1 : 255,0,128,2 where the last data is alpha value that should default to 1 if not provided. The input should be parsed and the color should be shown in a div next to the input.    
3.2 Another pattern that is accepted is 255 0 128  

4. When the final add is press or enter is pressed. The Web Component should dispatch a custom event with the color value as detail. The event should be named "color-added". The color value should be in the format of rgba(255, 0, 128, 1) where the alpha value is defaulted to 1 if not provided.                      

The RgbaList should listen to events from the RgbaInput and render a data item as a RgbListItem, the lis item should have a color swatch showing the color and the text should show the rgba value. The RgbListItem should have a delete button that when pressed will remove the item from the list.    The RgbaList should have a delete icon, so that the list can be maintained after sending data to it. All changes in the RgbaList should be transfered as properies to the RgbGradientBar, so that the gradient bar can update accordingly.                 
The RgbaList is the source-data from the RgbGradientBar and will show the accually gradiend based on the colors in the  RgbaList. The