namespace Zesty {
    public interface IGazeReceiver {
        /// <summary>
        /// Should be called when the object is being looked at
        /// </summary>
        void GazingUpon ();

        /// <summary>
        /// Should be called when the object is no longer being looked at
        /// </summary>
        void NotGazingUpon ();
    }
}