// @flow

import React, { Component } from 'react';

import JitsiMeetJS from '../../../../base/lib-jitsi-meet/_';

import AudioSettingsEntry, { type Props as AudioSettingsEntryProps } from './AudioSettingsEntry';
import Meter from './Meter';

const JitsiTrackEvents = JitsiMeetJS.events.track;

type Props = AudioSettingsEntryProps & {

    /**
     * The deviceId of the microphone.
     */
    deviceId: string,

    /**
     * Flag indicating if there is a problem with the device.
     */
    hasError?: boolean,

    /**
     * Flag indicating if there is a problem with the device.
     */
    index?: number,

    /**
     * The audio track for the current entry.
     */
    jitsiTrack: Object,

    /**
     * The length of the microphone list.
     */
    length: number,


    /**
     * Click handler for component.
     */
    onClick: Function,
    listHeaderId: string,

    /**
    * Used to decide whether to listen to audio level changes.
    */
    measureAudioLevels: boolean,
}

type State = {

    /**
     * The audio level.
     */
    level: number
}

/**
 * React {@code Component} representing an entry for the microphone audio settings.
 *
 * @param {Props} props - The props of the component.
 * @returns { ReactElement}
 */
export default class MicrophoneEntry extends Component<Props, State> {
    /**
     * Initializes a new {@code MicrophoneEntry} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            level: -1
        };
        this._onClick = this._onClick.bind(this);
        this._onKeyPress = this._onKeyPress.bind(this);
        this._updateLevel = this._updateLevel.bind(this);
    }

    _onClick: () => void;

    /**
     * Click handler for the entry.
     *
     * @returns {void}
     */
    _onClick() {
        this.props.onClick(this.props.deviceId);
    }

    /**
     * Key pressed handler for the entry.
     *
     * @returns {void}
     */
    _onKeyPress: (KeyboardEvent) => void;

    /**
     * Key pressed handler for the entry.
     *
     * @param {Object} e - The event.
     * @private
     *
     * @returns {void}
     */
    _onKeyPress(e) {
        if (e.key === ' ') {
            e.preventDefault();
            this.props.onClick(this.props.deviceId);
        }
    }

    _updateLevel: (number) => void;

    /**
     * Updates the level of the meter.
     *
     * @param {number} num - The audio level provided by the jitsiTrack.
     * @returns {void}
     */
    _updateLevel(num) {
        this.setState({
            level: Math.floor(num / 0.125)
        });
    }

    /**
     * Subscribes to audio level changes coming from the jitsiTrack.
     *
     * @returns {void}
     */
    _startListening() {
        const { jitsiTrack, measureAudioLevels } = this.props;

        jitsiTrack && measureAudioLevels && jitsiTrack.on(
            JitsiTrackEvents.TRACK_AUDIO_LEVEL_CHANGED,
            this._updateLevel);
    }

    /**
     * Unsubscribes from changes coming from the jitsiTrack.
     *
     * @param {Object} jitsiTrack - The jitsiTrack to unsubscribe from.
     * @returns {void}
     */
    _stopListening(jitsiTrack) {
        jitsiTrack && jitsiTrack.off(JitsiTrackEvents.TRACK_AUDIO_LEVEL_CHANGED, this._updateLevel);
        this.setState({
            level: -1
        });
    }

    /**
     * Implements React's {@link Component#componentDidUpdate}.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps: Props) {
        if (prevProps.jitsiTrack !== this.props.jitsiTrack) {
            this._stopListening(prevProps.jitsiTrack);
            this._startListening();
        }
    }

    /**
     * Implements React's {@link Component#componentDidMount}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._startListening();
    }

    /**
     * Implements React's {@link Component#componentWillUnmount}.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._stopListening(this.props.jitsiTrack);
    }

    /**
     * Implements React's {@link Component#render}.
     *
     * @inheritdoc
     */
    render() {
        const {
            deviceId,
            children,
            hasError,
            index,
            isSelected,
            length,
            jitsiTrack,
            listHeaderId,
            measureAudioLevels
        } = this.props;

        const deviceTextId: string = `choose_microphone${deviceId}`;

        const labelledby: string = `${listHeaderId} ${deviceTextId} `;

        const className = `audio-preview-microphone ${measureAudioLevels
            ? 'audio-preview-microphone--withmeter' : 'audio-preview-microphone--nometer'}`;

        return (
            <li
                aria-checked = { isSelected }
                aria-labelledby = { labelledby }
                aria-posinset = { index }
                aria-setsize = { length }
                className = { className }
                onClick = { this._onClick }
                onKeyPress = { this._onKeyPress }
                role = 'radio'
                tabIndex = { 0 }>
                <AudioSettingsEntry
                    hasError = { hasError }
                    isSelected = { isSelected }
                    labelId = { deviceTextId }>
                    {children}
                </AudioSettingsEntry>
                { Boolean(jitsiTrack) && measureAudioLevels && <Meter
                    className = 'audio-preview-meter-mic'
                    isDisabled = { hasError }
                    level = { this.state.level } />
                }
            </li>
        );
    }
}
