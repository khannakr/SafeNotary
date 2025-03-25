pragma circom 2.0.0;

template SimpleHash() {
    // Private input: secret value
    signal input secret;

    // Public input: expected hash value
    signal input expectedHash;

    // Output: isValid (1 if true, 0 if false)
    signal output isValid;

    // Create a signal for the difference
    signal diff;
    diff <== secret - expectedHash;
    
    // If diff is 0, then secret equals expectedHash
    // isEqual will be 1 if they are equal, 0 otherwise
    signal isEqual;
    isEqual <-- diff == 0 ? 1 : 0;
    
    // Constrain isEqual to be binary (0 or 1)
    isEqual * (1 - isEqual) === 0;
    
    // Constrain that if isEqual is 1, then diff must be 0
    diff * isEqual === 0;
    
    // Set our output
    isValid <== isEqual;
}

component main {public [expectedHash]} = SimpleHash();