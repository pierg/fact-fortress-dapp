import pyfhel

# Initialize the Pyfhel context
context = pyfhel.FHESecLevel()
context.generateKey()

# Generate the two arrays to compute the dot product of
array1 = [1, 2, 3, 4, 5]
array2 = [6, 7, 8, 9, 10]

# Encrypt the two arrays
enc_array1 = [context.encrypt(x) for x in array1]
enc_array2 = [context.encrypt(x) for x in array2]

# Compute the dot product of the two encrypted arrays
dot_product = context.add_many([context.multiply(enc_array1[i], enc_array2[i]) for i in range(len(array1))])

# Decrypt the dot product
plain_dot_product = context.decrypt(dot_product)

# Print the result
print("Dot product of {} and {} is: {}".format(array1, array2, plain_dot_product))
